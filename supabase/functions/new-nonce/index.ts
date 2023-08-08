import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const address = u.searchParams.get("address");

  const { error: deleteNonceError } = await supabase
    .from("nonce")
    .delete()
    .eq("id", address);

  if (deleteNonceError) {
    return responseError(deleteNonceError);
  }

  const { data, error } = await supabase
    .from("nonce")
    .insert({ id: address })
    .select();

  if (error) {
    return responseError(error);
  }

  return response(data[0]);
});
