import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getOwners } from "../_shared/nft.ts";
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
        const { data: roomProfilesData, error: roomProfilesError } =
          await supabase
            .from("room_profiles")
            .select()
            .eq("wallet_address", walletAddress)
            .eq("room", room);
        if (roomProfilesError) {
          return responseError(roomProfilesError);
        }
        const profile = roomProfilesData?.[0];
        if (profile?.pfp?.token_id) {
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
            .eq("token_id", profile.pfp.token_id)
            .gte("updated_at", oneHourAgo);

          if (selectError || !data || data.length === 0 || !data[0].owned) {
            const owners = await getOwners(chain, address, [
              BigInt(profile.pfp.token_id),
            ]);
            const { error: updateError } = await supabase
              .from("user_nft_ownership")
              .upsert({
                wallet_address: walletAddress,
                nft,
                token_id: profile.pfp.token_id,
                updated_at: new Date().toISOString(),
                owned: owners[0] === walletAddress,
              })
              .eq("wallet_address", walletAddress);
            if (updateError) {
              return responseError(updateError);
            }
            return response({
              owned: owners[0] === walletAddress,
              collection,
              profile,
            });
          } else {
            // If there's data updated within the last hour, return that data
            return response({ owned: data[0].owned, collection, profile });
          }
        }

        return response({ owned: false, collection, profile });
      }
    }
    return response({ owned: false, collection });
  }
  return response({ owned: false });
});
