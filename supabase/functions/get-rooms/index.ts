import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { response, responseError, serveWithOptions } from "../_shared/cors.ts";
import general_rooms from "../_shared/general_rooms.ts";
import {
  getCollectionInfo,
  getOwnedNFTCollections,
} from "../_shared/opensea.ts";

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
  nft: string;
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
  const token = u.searchParams.get("token");

  const rooms: { [category: string]: (GeneralRoom | NFTRoom)[] } = {
    "general": Object.values(general_rooms).map((room) => ({
      type: "general",
      name: room.name,
      uri: room.uri,
    })),
    "favorites": [],
    "hot": [],
    "owned": [],
  };

  const promises: Promise<void>[] = [];

  // get hot rooms
  promises.push((async () => {
    const { data: dailyMessageAnalysis, error: dailyMessageAnalysisError } =
      await supabase.from("daily_message_analysis")
        .select()
        .eq("date", new Date().toISOString().split("T")[0])
        .neq("room", "general")
        .order("message_count", { ascending: false })
        .limit(10);
    if (dailyMessageAnalysisError) throw dailyMessageAnalysisError;

    const hotPromises: Promise<void>[] = [];
    for (const analysis of dailyMessageAnalysis ?? []) {
      if (analysis.room.includes(":")) {
        hotPromises.push((async () => {
          const [chain, address] = analysis.room.split(":");
          const collection = await getCollectionInfo(chain, address);
          if (collection) {
            rooms.hot.push({
              type: "nft",
              nft: collection.nft,
              metadata: collection.metadata,
            });
          }
        })());
      } else {
        rooms.hot.push({
          type: "general",
          name: analysis.room,
          uri: analysis.room,
        });
      }
    }
    await Promise.all(hotPromises);
  })());

  if (token) {
    const walletAddress = (verify(
      token,
      Deno.env.get("JWT_SECRET")!,
    ) as any)?.wallet_address;

    if (walletAddress) {
      // get favorite rooms
      promises.push((async () => {
        const { data: favoriteRoomsData, error: favoriteRoomsError } =
          await supabase
            .from("favorite_rooms")
            .select()
            .eq("wallet_address", walletAddress);
        if (favoriteRoomsError) {
          throw new Error(favoriteRoomsError.message);
        }

        const favoritePromises: Promise<void>[] = [];
        for (const room of favoriteRoomsData[0]?.rooms ?? []) {
          if (room.includes(":")) {
            favoritePromises.push((async () => {
              const [chain, address] = room.split(":");
              const collection = await getCollectionInfo(chain, address);
              if (collection) {
                rooms.favorites.push({
                  type: "nft",
                  nft: collection.nft,
                  metadata: collection.metadata,
                });
              }
            })());
          } else {
            const roomInfo = general_rooms[room];
            if (roomInfo) {
              rooms.favorites.push({
                type: "general",
                name: roomInfo.name,
                uri: room,
              });
            }
          }
        }
        await Promise.all(favoritePromises);
      })());

      // get owned nft rooms
      promises.push((async () => {
        const collections = await getOwnedNFTCollections(walletAddress);
        rooms.owned = collections.map((collection) => ({
          type: "nft",
          nft: collection.nft,
          metadata: collection.metadata,
        }));
      })());
    }
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    return responseError(error);
  }
  return response(rooms);
});
