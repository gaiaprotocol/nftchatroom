import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getBalance } from "../_shared/nft.ts";
import { getCollectionInfo } from "../_shared/opensea.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const room = u.searchParams.get("room");
  const token = u.searchParams.get("token");

  if (room && room.includes(":")) {
    const [chain, address] = room.split(":");
    const collection = await getCollectionInfo(chain, address);

    if (token) {
      const walletAddress = (verify(
        token,
        Deno.env.get("JWT_SECRET")!,
      ) as any)?.wallet_address;

      if (walletAddress) {
        const nft = `${chain}:${ethers.getAddress(address)}`;

        // Calculate time for 1 hour ago from current time
        const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000)
          .toISOString();

        // Check for data updated in the last 1 hour
        const { data, error: selectError } = await supabase
          .from("user_nft_ownership")
          .select()
          .eq("wallet_address", walletAddress)
          .eq("nft", nft)
          .gte("updated_at", oneHourAgo);

        // If there's an error, or no data, or the NFT isn't owned, fetch NFT balance and update it
        if (selectError || !data || data.length === 0 || !data[0].owned) {
          const balance = await getBalance(chain, address, walletAddress);
          const { error: updateError } = await supabase
            .from("user_nft_ownership")
            .upsert({
              wallet_address: walletAddress,
              nft,
              updated_at: new Date().toISOString(),
              owned: balance > 0,
            })
            .eq("wallet_address", walletAddress);
          if (updateError) {
            return responseError(updateError);
          }
          return response({ owned: balance > 0, collection });
        } else {
          // If there's data updated within the last hour, return that data
          return response({ owned: data[0].owned, collection });
        }
      }
    }
    return response({ owned: false, collection });
  }

  return response({ owned: false });
});
