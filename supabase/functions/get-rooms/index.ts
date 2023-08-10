import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { response, serveWithOptions } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface GeneralRoom {
  type: "general",
  name: string;
  uri: string;
}

interface NFTRoom {
  type: "nft",
  icon: string;
  name: string;
  chain: string;
  address: string;
}

serveWithOptions(async (req) => {
  const u = new URL(req.url);
  const walletAddress = u.searchParams.get("wallet_address");

  const rooms: { [category: string]: (GeneralRoom | NFTRoom)[] } = {
    "general": [{
      type: "general",
      name: "General",
      uri: "general",
    }, {
      type: "general",
      name: "Memes",
      uri: "memes",
    }],
    "favorites": [],
    "hot": [{
      type: "nft",
      icon: "https://i.seadn.io/gcs/files/de65b5f2ac2e2195a453813c6a92580c.png?auto=format&dpr=1&w=3840",
      name: "The Gods",
      chain: "ethereum",
      address: "0x134590acb661da2b318bcde6b39ef5cf8208e372",
    }],
    "owned": [],
  };

  return response(rooms);
});
