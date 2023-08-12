import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { sign } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serveWithOptions(async (req) => {
  const { walletAddress, signedMessage } = await req.json();

  const { data: nonceData, error: nonceError } = await supabase
    .from("nonce")
    .select()
    .eq("id", walletAddress);

  if (nonceError) {
    return responseError(nonceError);
  }

  const verifiedAddress = ethers.verifyMessage(
    `Sign in to NFTChatRoom.com\nNonce: ${nonceData[0]?.nonce}`,
    signedMessage,
  );

  if (walletAddress !== verifiedAddress) {
    return responseError("Invalid signature");
  }

  const { error: deleteNonceError } = await supabase
    .from("nonce")
    .delete()
    .eq("id", walletAddress);

  if (deleteNonceError) {
    return responseError(deleteNonceError);
  }

  const token = sign(
    { wallet_address: walletAddress },
    Deno.env.get("JWT_SECRET")!,
  );
  return response({ token });
});
