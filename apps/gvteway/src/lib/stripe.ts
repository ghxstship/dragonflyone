import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  
  const apiKey = env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  
  _stripe = new Stripe(apiKey, {
    // Use the API version that matches the installed stripe package
    apiVersion: "2023-10-16",
    appInfo: {
      name: "GHXSTSHIP GVTEWAY",
      version: "0.1.0",
    },
  });
  
  return _stripe;
}

// Lazy-loaded Stripe client
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: keyof Stripe) {
    return getStripe()[prop];
  },
});
