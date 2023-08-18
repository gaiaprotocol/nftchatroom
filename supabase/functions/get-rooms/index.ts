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
  favoriteCount: number;
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
    const start1 = Date.now();
    const { data, error } = await supabase.from("daily_message_analysis")
      .select()
      .eq("date", new Date().toISOString().split("T")[0])
      .neq("room", "general")
      .order("message_count", { ascending: false })
      .limit(10);
    //const { data, error } = await supabase.rpc("get_hot_rooms");
    if (error) throw error;
    console.log(`get daily message analysis v2 ${Date.now() - start1}ms`);

    const start2 = Date.now();
    const hotPromises: Promise<void>[] = [];
    for (const analysis of data ?? []) {
      if (analysis.room.includes(":")) {
        hotPromises.push((async () => {
          const [chain, address] = analysis.room.split(":");
          const collection = await getCollectionInfo(chain, address);
          if (collection) {
            rooms.hot.push({
              type: "nft",
              nft: collection.nft,
              metadata: collection.metadata,
              favoriteCount: collection.favorite_count,
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
    console.log(`get hot rooms ${Date.now() - start2}ms`);
  })());

  if (token) {
    const walletAddress = (verify(
      token,
      Deno.env.get("JWT_SECRET")!,
    ) as any)?.wallet_address;

    if (walletAddress) {
      // get favorite rooms
      promises.push((async () => {
        const start = Date.now();
        const { data: favoriteRoomsData, error: favoriteRoomsError } =
          await supabase
            .from("favorite_rooms")
            .select()
            .eq("wallet_address", walletAddress);
        if (favoriteRoomsError) {
          throw new Error(favoriteRoomsError.message);
        }

        const favoritePromises: Promise<void>[] = [];
        for (const room of favoriteRoomsData.map((r) => r.room)) {
          if (room.includes(":")) {
            favoritePromises.push((async () => {
              const [chain, address] = room.split(":");
              const collection = await getCollectionInfo(chain, address);
              if (collection) {
                rooms.favorites.push({
                  type: "nft",
                  nft: collection.nft,
                  metadata: collection.metadata,
                  favoriteCount: collection.favorite_count,
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
        console.log(`get favorite rooms ${Date.now() - start}ms`);
      })());

      // get owned nft rooms
      promises.push((async () => {
        const start = Date.now();
        const collections = await getOwnedNFTCollections(walletAddress);
        rooms.owned = collections.map((collection) => ({
          type: "nft",
          nft: collection.nft,
          metadata: collection.metadata,
          favoriteCount: collection.favorite_count,
        }));
        console.log(`get owned nft rooms ${Date.now() - start}ms`);
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
