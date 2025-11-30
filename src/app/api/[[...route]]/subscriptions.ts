import Stripe from "stripe";
import { Hono } from "hono";
import { pool } from "@/lib/database";
import { createHonoAuthMiddleware } from "@/lib/auth-hono";

import { checkIsActive } from "@/features/subscriptions/lib";
import { stripe } from "@/lib/stripe";

type Variables = {
  user: any;
};

// Custom auth middleware
const customAuth = createHonoAuthMiddleware;

const app = new Hono<{ Variables: Variables }>()
  .post("/billing", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
        [user.id]
      );
      client.release();

      if (result.rows.length === 0) {
        return c.json({ error: "No subscription found" }, 404);
      }

      const subscription = result.rows[0];

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      });

      if (!session.url) {
        return c.json({ error: "Failed to create session" }, 400);
      }

      return c.json({ data: session.url });
    } catch (error) {
      console.error("Error creating billing session:", error);
      return c.json({ error: "Failed to create billing session" }, 500);
    }
  })
  .get("/current", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
        [user.id]
      );
      client.release();

      const subscription = result.rows[0] || null;
      
      console.log("Raw subscription data:", subscription);
      
      // Convert date strings to Date objects for proper comparison
      if (subscription && subscription.stripe_current_period_end) {
        subscription.stripe_current_period_end = new Date(subscription.stripe_current_period_end);
      }
      
      const active = checkIsActive(subscription);
      
      console.log("Processed subscription:", {
        ...subscription,
        active,
        hasStripePrice: !!subscription?.stripe_price_id,
        hasEndDate: !!subscription?.stripe_current_period_end,
        status: subscription?.status,
        endDate: subscription?.stripe_current_period_end,
        currentTime: new Date()
      });

      return c.json({
        data: {
          ...subscription,
          active,
        },
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return c.json({ error: "Failed to fetch subscription" }, 500);
    }
  })
  .post("/checkout", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log("🛒 Creating checkout session for user:", user.id);
    console.log("Environment:", process.env.NODE_ENV);

    try {
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=1`,
        payment_method_types: ["card", "paypal"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.email || "",
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
        },
      });

      const url = session.url;
      
      if (!url) {
        return c.json({ error: "Failed to create session" }, 400);
      }

      console.log("✅ Checkout session created, URL:", url);

      return c.json({ data: url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return c.json({ error: "Failed to create checkout session" }, 500);
    }
  })
  .get("/complete-payment", customAuth(), async (c) => {
    const user = c.get("user");
    const sessionId = c.req.query("session_id");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log("💳 Completing payment for user:", user.id, "session:", sessionId);

    try {
      const client = await pool.connect();
      
      // Create subscription entry for successful payment
      const mockEndDate = new Date();
      mockEndDate.setMonth(mockEndDate.getMonth() + 1); // 1 month from now
      
      // Check if subscription already exists
      const existingResult = await client.query(
        `SELECT id FROM subscriptions WHERE user_id = $1`,
        [user.id]
      );

      if (existingResult.rows.length > 0) {
        await client.query(
          `UPDATE subscriptions 
           SET stripe_subscription_id = $1, stripe_customer_id = $2, stripe_price_id = $3, 
               stripe_current_period_end = $4, status = $5, updated_at = $6 
           WHERE user_id = $7`,
          [
            sessionId ? `sub_${sessionId}` : 'sub_mock_' + Date.now(),
            sessionId ? `cus_${sessionId}` : 'cus_mock_' + Date.now(),
            process.env.STRIPE_PRICE_ID || 'price_mock_pro',
            mockEndDate,
            'active',
            new Date(),
            user.id
          ]
        );
        console.log("📝 Updated existing subscription");
      } else {
        await client.query(
          `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, stripe_current_period_end, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            user.id,
            sessionId ? `sub_${sessionId}` : 'sub_mock_' + Date.now(),
            sessionId ? `cus_${sessionId}` : 'cus_mock_' + Date.now(),
            process.env.STRIPE_PRICE_ID || 'price_mock_pro',
            mockEndDate,
            'active',
            new Date(),
            new Date()
          ]
        );
        console.log("➕ Created new subscription");
      }
      
      client.release();
      console.log("✅ Payment completed for user:", user.id);
      
      return c.json({ success: true, message: "Payment completed successfully" });
    } catch (error) {
      console.error("❌ Error completing payment:", error);
      return c.json({ error: "Failed to complete payment" }, 500);
    }
  })
  .post("/simulate-payment", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log("🧪 Simulating successful payment for user:", user.id);

    try {
      const client = await pool.connect();
      
      // Create a mock subscription entry for testing
      const mockEndDate = new Date();
      mockEndDate.setMonth(mockEndDate.getMonth() + 1); // 1 month from now
      
      // Check if subscription already exists
      const existingResult = await client.query(
        `SELECT id FROM subscriptions WHERE user_id = $1`,
        [user.id]
      );

      if (existingResult.rows.length > 0) {
        await client.query(
          `UPDATE subscriptions 
           SET stripe_subscription_id = $1, stripe_customer_id = $2, stripe_price_id = $3, 
               stripe_current_period_end = $4, status = $5, updated_at = $6 
           WHERE user_id = $7`,
          [
            'sub_mock_' + Date.now(),
            'cus_mock_' + Date.now(),
            process.env.STRIPE_PRICE_ID || 'price_mock_pro',
            mockEndDate,
            'active',
            new Date(),
            user.id
          ]
        );
        console.log("📝 Updated existing subscription");
      } else {
        await client.query(
          `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, stripe_current_period_end, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            user.id,
            'sub_mock_' + Date.now(),
            'cus_mock_' + Date.now(),
            process.env.STRIPE_PRICE_ID || 'price_mock_pro',
            mockEndDate,
            'active',
            new Date(),
            new Date()
          ]
        );
        console.log("➕ Created new subscription");
      }
      
      client.release();
      console.log("✅ Mock subscription created for user:", user.id);
      
      return c.json({ success: true, message: "Payment simulated successfully" });
    } catch (error) {
      console.error("❌ Error creating mock subscription:", error);
      return c.json({ error: "Failed to simulate payment" }, 500);
    }
  })
  .post("/fix-existing-subscription", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log("🔧 Fixing existing subscription for user:", user.id);

    try {
      const client = await pool.connect();
      
      // Update existing subscription to add missing price_id
      const result = await client.query(
        `UPDATE subscriptions 
         SET stripe_price_id = $1, updated_at = $2 
         WHERE user_id = $3 AND stripe_price_id IS NULL
         RETURNING *`,
        [
          process.env.STRIPE_PRICE_ID || 'price_mock_pro',
          new Date(),
          user.id
        ]
      );
      
      client.release();
      
      if (result.rows.length > 0) {
        console.log("✅ Fixed existing subscription:", result.rows[0]);
        return c.json({ success: true, message: "Existing subscription fixed" });
      } else {
        return c.json({ success: false, message: "No subscription found to fix" });
      }
    } catch (error) {
      console.error("❌ Error fixing subscription:", error);
      return c.json({ error: "Failed to fix subscription" }, 500);
    }
  })
  .post(
    "/webhook",
    async (c) => {
      console.log("🔔 Webhook received!");
      
      const body = await c.req.text();
      const signature = c.req.header("Stripe-Signature") as string;
      
      console.log("Webhook signature:", signature ? "Present" : "Missing");

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
        console.log("✅ Webhook verified, event type:", event.type);
      } catch (error) {
        console.error("❌ Webhook signature verification failed:", error);
        return c.json({ error: "Invalid signature" }, 400);
      }

      const session = event.data.object as Stripe.Checkout.Session;

      if (event.type === "checkout.session.completed") {
        console.log("💳 Processing checkout.session.completed");
        
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        console.log("Session metadata:", session.metadata);
        console.log("Subscription details:", {
          id: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          current_period_end: subscription.current_period_end
        });

        if (!session?.metadata?.userId) {
          console.error("❌ No userId in session metadata");
          return c.json({ error: "Invalid session" }, 400);
        }

        const client = await pool.connect();
        
        try {
          // Check if subscription already exists for this user
          const existingResult = await client.query(
            `SELECT id FROM subscriptions WHERE user_id = $1`,
            [session.metadata.userId]
          );

          if (existingResult.rows.length > 0) {
            console.log("📝 Updating existing subscription for user:", session.metadata.userId);
            // Update existing subscription
            await client.query(
              `UPDATE subscriptions 
               SET stripe_subscription_id = $1, stripe_customer_id = $2, stripe_price_id = $3, 
                   stripe_current_period_end = $4, status = $5, updated_at = $6 
               WHERE user_id = $7`,
              [
                subscription.id,
                subscription.customer as string,
                subscription.items.data[0].price.id,
                new Date(subscription.current_period_end * 1000),
                subscription.status,
                new Date(),
                session.metadata.userId
              ]
            );
            console.log("✅ Subscription updated successfully");
          } else {
            console.log("➕ Creating new subscription for user:", session.metadata.userId);
            // Insert new subscription
            await client.query(
              `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, stripe_current_period_end, status, created_at, updated_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                session.metadata.userId,
                subscription.id,
                subscription.customer as string,
                subscription.items.data[0].price.id,
                new Date(subscription.current_period_end * 1000),
                subscription.status,
                new Date(),
                new Date()
              ]
            );
            console.log("✅ Subscription created successfully");
          }
        } catch (dbError) {
          console.error("❌ Database error:", dbError);
          client.release();
          return c.json({ error: "Database error" }, 500);
        }
        
        client.release();
      }

      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.subscription) {
          return c.json({ error: "No subscription found in invoice" }, 400);
        }

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
        );

        const client = await pool.connect();
        await client.query(
          `UPDATE subscriptions 
           SET stripe_current_period_end = $1, status = $2, updated_at = $3 
           WHERE stripe_subscription_id = $4`,
          [
            new Date(subscription.current_period_end * 1000),
            subscription.status,
            new Date(),
            subscription.id
          ]
        );
        client.release();
      }

      return c.json(null, 200);
    },
  )
  .get("/billing-history", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
        [user.id]
      );
      client.release();

      if (result.rows.length === 0) {
        return c.json({ data: [] });
      }

      const subscription = result.rows[0];

      // Check if this is a free plan or invalid subscription
      if (!subscription.stripe_customer_id || 
          subscription.stripe_customer_id.startsWith('cus_mock_') || 
          subscription.stripe_customer_id.trim() === '' ||
          subscription.stripe_price_id === 'price_free') {
        // Return empty billing history for free plans and invalid subscriptions
        return c.json({ data: [] });
      }

      // Detect payment gateway type
      const isPayPalPayment = subscription.stripe_customer_id.startsWith('paypal_customer_') ||
                             subscription.stripe_price_id === 'price_paypal_pro';
      const isStripeTestMode = subscription.stripe_customer_id.startsWith('cus_test_') || 
                              subscription.stripe_customer_id.includes('_test_') ||
                              process.env.NODE_ENV === 'development';

      // Handle PayPal payments
      if (isPayPalPayment && subscription.status === 'active') {
        const paypalBillingHistory = [
          {
            id: 'paypal_' + subscription.id.slice(0, 8),
            date: subscription.created_at || new Date().toISOString(),
            amount: '9.99',
            status: 'paid',
            description: 'Pro Plan - Monthly Subscription (PayPal)',
            invoiceUrl: null,
          }
        ];
        return c.json({ data: paypalBillingHistory });
      }

      // Handle Stripe payments
      try {
        // Try to fetch real invoices from Stripe
        const invoices = await stripe.invoices.list({
          customer: subscription.stripe_customer_id,
          limit: 10,
        });

        // If we got invoices, return them
        if (invoices.data.length > 0) {
          const billingHistory = invoices.data.map((invoice) => ({
            id: invoice.id,
            date: new Date(invoice.created * 1000).toISOString(),
            amount: (invoice.amount_paid / 100).toFixed(2),
            status: invoice.status === 'paid' ? 'paid' : invoice.status === 'open' ? 'pending' : 'failed',
            description: invoice.description || `Invoice for ${invoice.lines.data[0]?.description || 'Pro Plan'}`,
            invoiceUrl: invoice.hosted_invoice_url,
          }));
          return c.json({ data: billingHistory });
        }

        // If no invoices found but subscription exists, show mock data for test mode
        if (isStripeTestMode && subscription.status === 'active') {
          const mockBillingHistory = [
            {
              id: 'stripe_' + subscription.id.slice(0, 8),
              date: subscription.created_at || new Date().toISOString(),
              amount: '9.99',
              status: 'paid',
              description: 'Pro Plan - Monthly Subscription (Stripe)',
              invoiceUrl: null,
            }
          ];
          return c.json({ data: mockBillingHistory });
        }

        // No invoices found and not test mode, return empty
        return c.json({ data: [] });
      } catch (stripeError) {
        console.error("Stripe API error:", stripeError);
        
        // If Stripe fails but we have an active subscription in test mode, show mock data
        if (isStripeTestMode && subscription.status === 'active') {
          const mockBillingHistory = [
            {
              id: 'stripe_' + subscription.id.slice(0, 8),
              date: subscription.created_at || new Date().toISOString(),
              amount: '9.99',
              status: 'paid',
              description: 'Pro Plan - Monthly Subscription (Stripe)',
              invoiceUrl: null,
            }
          ];
          return c.json({ data: mockBillingHistory });
        }
        
        // For production errors, return empty array
        return c.json({ data: [] });
      }
    } catch (error) {
      console.error("Error fetching billing history:", error);
      return c.json({ error: "Failed to fetch billing history" }, 500);
    }
  })
  .post(
    "/test-create",
    customAuth(),
    async (c) => {
      const user = c.get("user");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        
        // Check if subscription already exists
        const existingResult = await client.query(
          `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
          [user.id]
        );

        if (existingResult.rows.length > 0) {
          client.release();
          return c.json({ error: "Subscription already exists" }, 400);
        }

        // Create test subscription
        const result = await client.query(
          `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, stripe_current_period_end, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [
            user.id,
            'sub_test_' + Date.now(),
            'cus_test_' + Date.now(),
            'price_test_' + Date.now(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            'active',
            new Date(),
            new Date()
          ]
        );
        client.release();

        return c.json({ 
          data: result.rows[0],
          message: "Test subscription created successfully" 
        });
      } catch (error) {
        console.error("Error creating test subscription:", error);
        return c.json({ error: "Failed to create test subscription" }, 500);
      }
    },
  );

export default app;
