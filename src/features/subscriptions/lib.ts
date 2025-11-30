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
    // Free plan is always active
    if (subscription.status === 'free') {
      active = false; // Free plan users should see upgrade prompts
    }
    // Pro plan requires valid subscription data
    else if (
      subscription.stripe_price_id &&
      subscription.stripe_current_period_end &&
      subscription.status === 'active'
    ) {
      const periodEndTime = subscription.stripe_current_period_end.getTime();
      const currentTime = Date.now();
      const gracePeriod = DAY_IN_MS;
      
      active = periodEndTime + gracePeriod > currentTime;
    }
  }

  return active;
};
