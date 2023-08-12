import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, serveWithOptions } from "../_shared/cors.ts";

// deno-lint-ignore require-await
serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const token = u.searchParams.get("token");

  if (token) {
    const walletAddress = (verify(
      token,
      Deno.env.get("JWT_SECRET")!,
    ) as any)?.wallet_address;

    if (walletAddress) {
      return response({ walletAddress });
    }
  }

  return response({});
});
