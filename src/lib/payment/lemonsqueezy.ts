import crypto from "node:crypto";

type BillingPlan = "basic" | "pro";

const PLAN_ENV_MAP: Record<BillingPlan, { variant: string; checkout: string }> = {
  basic: {
    variant: "LEMONSQUEEZY_BASIC_VARIANT_ID",
    checkout: "LEMONSQUEEZY_BASIC_CHECKOUT_URL",
  },
  pro: {
    variant: "LEMONSQUEEZY_PRO_VARIANT_ID",
    checkout: "LEMONSQUEEZY_PRO_CHECKOUT_URL",
  },
};

export function getCheckoutUrl(plan: BillingPlan, email?: string | null) {
  return buildCheckoutUrl(plan, { email });
}

export function buildCheckoutUrl(
  plan: BillingPlan,
  options?: {
    email?: string | null;
    successUrl?: string;
    cancelUrl?: string;
  }
) {
  const config = PLAN_ENV_MAP[plan];
  const directUrl = process.env[config.checkout];
  if (!directUrl) return null;

  try {
    const url = new URL(directUrl);
    if (options?.email) {
      url.searchParams.set("checkout[email]", options.email);
    }
    url.searchParams.set("checkout[custom][plan]", plan);
    if (options?.successUrl) {
      url.searchParams.set("checkout[success_url]", options.successUrl);
    }
    if (options?.cancelUrl) {
      url.searchParams.set("checkout[cancel_url]", options.cancelUrl);
    }
    return url.toString();
  } catch {
    return directUrl;
  }
}

export function verifyLemonSqueezyWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function mapVariantToPlan(variantId: string | number | null | undefined): BillingPlan | "free" {
  const normalized = String(variantId || "");
  if (normalized && normalized === String(process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || "")) {
    return "basic";
  }
  if (normalized && normalized === String(process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "")) {
    return "pro";
  }
  return "free";
}
