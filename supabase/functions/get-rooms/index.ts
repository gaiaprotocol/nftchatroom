import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { response, serveWithOptions } from "../_shared/cors.ts";
import { getCollectionInfo, getOwnedNFTCollections } from "../_shared/nft.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface GeneralRoom {
  type: "general";
  name: string;
  uri: string;
}

interface NFTRoom {
  type: "nft";
  chain: string;
  address: string;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    bannerImage?: string;
    externalLink?: string;
    discordURL?: string;
    telegramURL?: string;
    twitterUsername?: string;
    slug?: string;
  };
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
    "hot": [],
    "owned": [],
  };

  const { data: dailyMessageAnalysis, error: dailyMessageAnalysisError } =
    await supabase.from("daily_message_analysis")
      .select()
      .eq("date", new Date().toISOString().split("T")[0])
      .neq("room", "general")
      .order("message_count", { ascending: false })
      .limit(10);
  if (dailyMessageAnalysisError) throw dailyMessageAnalysisError;

  for (const analysis of dailyMessageAnalysis ?? []) {
    if (analysis.room.includes(":")) {
      const [chain, address] = analysis.room.split(":");
      const collection = await getCollectionInfo(chain, address);
      if (collection) {
        rooms.hot.push({
          type: "nft",
          chain,
          address,
          metadata: collection.metadata,
        });
      }
    } else {
      rooms.hot.push({
        type: "general",
        name: analysis.room,
        uri: analysis.room,
      });
    }
  }

  if (walletAddress) {
    const collections = await getOwnedNFTCollections(walletAddress);
    rooms.owned = collections.map((collection) => ({
      type: "nft",
      chain: "ethereum",
      address: collection.address,
      metadata: collection.metadata,
    }));
  }

  return response(rooms);
});
