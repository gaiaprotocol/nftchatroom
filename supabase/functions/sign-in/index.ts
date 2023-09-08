import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";
import { sign, verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import { getENS } from "../_shared/ens.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function checkToken(token: string) {
  const walletAddress = (verify(
    token,
    Deno.env.get("JWT_SECRET")!,
  ) as any)?.wallet_address;

  if (!walletAddress) {
    throw new Error("Invalid token");
  }

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
      throw new Error(updateError.message);
    }
    user = updateData[0];
  } else {
    user = data[0];
  }

  return { walletAddress, user };
}

async function signIn(walletAddress: string, signedMessage: string) {
  const { data: nonceData, error: nonceError } = await supabase
    .from("nonce")
    .select()
    .eq("id", walletAddress);

  if (nonceError) {
    throw new Error(nonceError.message);
  }

  const verifiedAddress = ethers.verifyMessage(
    `Sign in to NFTChatRoom.com\nNonce: ${nonceData[0]?.nonce}`,
    signedMessage,
  );

  if (walletAddress !== verifiedAddress) {
    throw new Error("Invalid signature");
  }

  // Delete nonce
  await supabase
    .from("nonce")
    .delete()
    .eq("id", walletAddress);

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
      throw new Error(updateError.message);
    }
    user = updateData[0];
  } else {
    user = data[0];
  }

  const token = sign(
    { wallet_address: walletAddress },
    Deno.env.get("JWT_SECRET")!,
  );
  return { token, user };
}

serveWithOptions(async (req) => {
  const { token, walletAddress, signedMessage } = await req.json();
  try {
    if (token) {
      const { walletAddress, user } = await checkToken(token);
      return response({ walletAddress, user });
    } else if (walletAddress && signedMessage) {
      const { token, user } = await signIn(walletAddress, signedMessage);
      return response({ token, user });
    } else {
      throw new Error("Invalid request");
    }
  } catch (e) {
    return responseError(e.message);
  }
});
