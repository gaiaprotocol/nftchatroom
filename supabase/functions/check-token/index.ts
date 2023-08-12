import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getENS } from "../_shared/ens.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const token = u.searchParams.get("token");

  if (token) {
    const walletAddress = (verify(
      token,
      Deno.env.get("JWT_SECRET")!,
    ) as any)?.wallet_address;

    if (walletAddress) {
      // Calculate time for 1 hour ago from current time
      const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000)
        .toISOString();

      // Check for data updated in the last 1 hour
      const { data, error: selectError } = await supabase
        .from("user_details")
        .select()
        .eq("wallet_address", walletAddress)
        .gte("ens_updated_at", oneHourAgo);

      let user: any | undefined;

      // If there's an error, or no data, or the NFT isn't owned, fetch NFT balance and update it
      if (selectError || !data || data.length === 0) {
        const ens = await getENS(walletAddress);
        const { data: updateData, error: updateError } = await supabase
          .from("user_details")
          .upsert({
            wallet_address: walletAddress,
            ens,
            ens_updated_at: new Date().toISOString(),
          })
          .eq("wallet_address", walletAddress)
          .select();
        if (updateError) {
          return responseError(updateError);
        }
        user = updateData[0];
      } else {
        user = data[0];
      }

      return response({ walletAddress, user });
    }
  }

  return response({});
});
