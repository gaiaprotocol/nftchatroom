import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  let { token, room } = await req.json();
  if (token && room) {
    const walletAddress = (verify(
      token,
      Deno.env.get("JWT_SECRET")!,
    ) as any)?.wallet_address;

    if (walletAddress) {
      if (room.includes(":")) {
        const [chain, address] = room.split(":");
        room = `${chain}:${ethers.getAddress(address)}`;
      }

      if (req.method === "POST") { // add favorite room
        const { error: insertError } = await supabase
          .from("favorite_rooms")
          .insert({
            wallet_address: walletAddress,
            room,
          });
        if (insertError) {
          return responseError(insertError);
        }
      } else if (req.method === "DELETE") { // remove favorite room
        const { error: deleteError } = await supabase
          .from("favorite_rooms")
          .delete()
          .eq("wallet_address", walletAddress)
          .eq("room", room);
        if (deleteError) {
          return responseError(deleteError);
        }
      }
    }
  }
  return response({});
});
