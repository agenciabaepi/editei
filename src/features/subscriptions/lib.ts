// TODO: Replace with custom subscription schema when needed
// import { subscriptions } from "@/db/schema";

const DAY_IN_MS = 86_400_000;

// Define subscription type locally since we removed Drizzle schema
type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_price_id?: string | null;
  stripe_current_period_end?: Date | null;
  status?: string | null;
};

export const checkIsActive = (
  subscription: Subscription,
) => {
  let active = false;

  if (subscription) {
    // Free plan is always inactive
    if (subscription.status === 'free') {
      active = false; // Free plan users should see upgrade prompts
    }
    // Pro plan - check if status is active
    else if (subscription.status === 'active') {
      // If there's a period end date, check if it's still valid
      if (subscription.stripe_current_period_end) {
        const periodEndTime = subscription.stripe_current_period_end.getTime();
        const currentTime = Date.now();
        const gracePeriod = DAY_IN_MS;
        
        active = periodEndTime + gracePeriod > currentTime;
      } else {
        // If no period end date but status is active, consider it active
        // This handles admin-created subscriptions without period end
        active = true;
      }
    }
    // If status is 'trialing', also consider active
    else if (subscription.status === 'trialing') {
      active = true;
    }
  }

  return active;
};
