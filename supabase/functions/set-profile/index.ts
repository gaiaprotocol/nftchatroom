import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getOwners } from "../_shared/nft.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const { token, room, introduction, pfp } = await req.json();
  if (token) {
    const walletAddress = (verify(
      token,
      Deno.env.get("JWT_SECRET")!,
    ) as any)?.wallet_address;

    if (walletAddress) {
      if (room?.includes(":")) {
        const [chain, address] = room.split(":");
        const nft = `${chain}:${ethers.getAddress(address)}`;

        const owners = await getOwners(chain, address, [
          BigInt(pfp.token_id),
        ]);

        if (owners[0] === walletAddress) {
          const { error } = await supabase
            .from("room_profiles")
            .upsert({
              wallet_address: walletAddress,
              room,
              pfp,
            })
            .eq("wallet_address", walletAddress)
            .eq("room", room);
          if (error) {
            return responseError(error);
          }
        }

        const { error: updateError } = await supabase
          .from("user_nft_ownership")
          .upsert({
            wallet_address: walletAddress,
            nft,
            token_id: pfp.token_id,
            updated_at: new Date().toISOString(),
            owned: owners[0] === walletAddress,
          })
          .eq("wallet_address", walletAddress);
        if (updateError) {
          return responseError(updateError);
        }
      } else {
        const { error } = await supabase
          .from("user_details")
          .update({
            introduction,
            pfp,
          })
          .eq("wallet_address", walletAddress);
        if (error) {
          return responseError(error);
        }
      }
    }
  }
  return response({});
});
