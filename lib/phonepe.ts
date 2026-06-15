import { StandardCheckoutClient, Env } from "@phonepe-pg/pg-sdk-node";

/**
 * Creates a PhonePe StandardCheckoutClient for a given store's credentials.
 *
 * NOTE: The SDK's `getInstance` is a singleton keyed by clientId.
 * If the same clientId is used across calls, it returns the cached instance.
 * This is fine for a single-store deployment, but for multi-store with
 * different credentials each store gets its own singleton.
 */
export function getPhonePeClient(
  clientId: string,
  clientSecret: string,
  clientVersion: number
): StandardCheckoutClient {
  const env =
    process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

  return StandardCheckoutClient.getInstance(
    clientId,
    clientSecret,
    clientVersion,
    env
  );
}
