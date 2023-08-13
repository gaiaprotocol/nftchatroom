import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const walletAddress = u.searchParams.get("wallet_address");
  const room = u.searchParams.get("room");
  if (walletAddress) {
    const { data, error } = await supabase
      .from("user_details")
      .select()
      .eq("wallet_address", walletAddress);
    if (error) {
      return responseError(error);
    }
    if (!data[0]) {
      return responseError("User not found");
    }
    if (room) { // load room profile
      const { data: roomProfile, error: roomProfilesError } = await supabase
        .from("room_profiles")
        .select()
        .eq("wallet_address", walletAddress)
        .eq("room", room);
      if (roomProfilesError) {
        return responseError(roomProfilesError);
      }
      data[0].pfp = roomProfile[0]?.pfp;
    }
    return response(data[0]);
  } else {
    return responseError("Missing wallet address");
  }
});
