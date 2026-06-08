import client from "./client";

/**
 * Assign free trial subscription to the registered tenant owner
 */
export async function assignFreeTrial() {
  const response = await client.post("/subscription/free-trial", {});
  return response.data;
}
