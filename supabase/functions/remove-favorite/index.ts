import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const { token, room } = await req.json();

  if (token && room) {
    const walletAddress = (verify(
      token,
      Deno.env.get("JWT_SECRET")!,
    ) as any)?.wallet_address;

    if (walletAddress) {
      const { data: selectData, error: selectError } = await supabase
        .from("favorite_rooms")
        .select()
        .eq("wallet_address", walletAddress);
      if (selectError) {
        return responseError(selectError);
      }

      if (selectData[0]?.rooms.includes(room)) {
        const { error: updateError } = await supabase
          .from("favorite_rooms")
          .update({
            rooms: selectData[0].rooms.filter((r: string) => r !== room),
          })
          .eq("wallet_address", walletAddress);
        if (updateError) {
          return responseError(updateError);
        }
      }
    }
  }
  return response({});
});
