import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { ethers } from "https://esm.sh/ethers@6.7.0";

const openSeaKey = Deno.env.get("OPENSEA_KEY")!;

export const blacklist = [
  // opensea collection
  "0x495f947276749Ce646f68AC8c248420045cb7b5e",

  // gaia gods v1 addresses
  "0xb48E526d935BEe3891222f6aC10A253e31CCaBE1",
  "0xFfFd676Bffd8797f34C2Adc3E808F374CAEe49D8",
  "0xe7df0DcA32eb23F4182055dC6a2053A3fF239315",
  "0xe9A10bB97DDb4bCD7677393405B4b769273CeF3c",
  "0x5428dB8Fd0063390b3357D78d56f183D6755A446",
  "0x20a33C651373cde978daE404760e853fAE877588",
  "0x9f69C2a06c97fCAAc1E586b30Ea681c43975F052",
  "0xa5f5b6C05a6d48a56E95E4Ce15078008a18BC79B",
  "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  "0x9f69C2a06c97fCAAc1E586b30Ea681c43975F052",
  "0xb5a453d6d079d3aE2A103E1B2Daef33b698F706E",
];

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export async function getOwnedNFTs(owner: string, address?: string) {
  const result = await fetch(
    address
      ? `https://api.opensea.io/api/v1/assets?owner=${owner}&asset_contract_address=${address}&limit=200`
      : `https://api.opensea.io/api/v1/assets?owner=${owner}&limit=200`,
    {
      headers: {
        "X-API-KEY": openSeaKey,
      },
    },
  );
  return (await result.json()).assets ?? [];
}

export async function getOwnedNFTCollections(owner: string) {
  const nfts = await getOwnedNFTs(owner);

  const collections: {
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
    editors: string[];
  }[] = [];

  for (const nft of nfts) {
    if (nft.asset_contract && nft.asset_contract.schema_name === "ERC721") {
      const address = ethers.getAddress(nft.asset_contract.address);
      const nftPath = `ethereum:${address}`;
      if (collections.find((c) => c.nft === nftPath)) continue;

      collections.push({
        nft: nftPath,
        metadata: {
          name: nft.collection.name ?? undefined,
          description: nft.collection.description ?? undefined,
          image: nft.collection.image_url ?? undefined,
          bannerImage: nft.collection.banner_image_url ?? undefined,
          externalLink: nft.collection.external_link ?? undefined,
          discordURL: nft.collection.discord_url ?? undefined,
          telegramURL: nft.collection.telegram_url ?? undefined,
          twitterUsername: nft.collection.twitter_username ?? undefined,
          slug: nft.collection.slug ?? undefined,
        },
        editors: [ethers.getAddress(nft.creator.address)],
      });
    }
  }
  const { data: selectData, error } = await supabase.from("nft_collections")
    .upsert(collections).select();
  if (error) throw error;

  return selectData.filter((c) => !blacklist.includes(c.nft.split(":")[1]));
}

/*export async function getOwnedNFTsV2(chain: string, owner: string): Promise<{
  contract: string;
}[]> {
  const result = await fetch(
    `https://api.opensea.io/v2/chain/${chain}/account/${owner}/nfts?limit=50`,
    {
      headers: {
        "X-API-KEY": openSeaKey,
      },
    },
  );
  return (await result.json()).nfts ?? [];
}*/

export async function getCollectionInfo(chain: string, address: string) {
  address = ethers.getAddress(address);

  const nftPath = `${chain}:${address}`;

  const { data: selectData } = await supabase.from("nft_collections").select()
    .eq("nft", nftPath);
  if (selectData && selectData.length > 0) return selectData[0];

  const response = await fetch(
    `https://api.opensea.io/v2/chain/${chain}/contract/${address}/nfts?limit=1`,
    {
      headers: {
        "X-API-KEY": openSeaKey,
      },
    },
  );
  if (response.status !== 200) {
    console.error(await response.text());
    throw new Error("OpenSea API error");
  }
  const data: any = await response.json();
  const nft = data.nfts[0];
  if (nft) {
    const response = await fetch(
      `https://api.opensea.io/api/v1/collection/${nft.collection}`,
      {
        headers: {
          "X-API-KEY": openSeaKey,
        },
      },
    );
    if (response.status !== 200) {
      console.error(await response.text());
      throw new Error("OpenSea API error");
    }
    const data: any = await response.json();
    const _collection = data.collection;
    const collection = {
      nft: nftPath,
      metadata: {
        name: _collection.name ?? undefined,
        description: _collection.description ?? undefined,
        image: _collection.image_url ?? undefined,
        bannerImage: _collection.banner_image_url ?? undefined,
        externalLink: _collection.external_link ?? undefined,
        discordURL: _collection.discord_url ?? undefined,
        telegramURL: _collection.telegram_url ?? undefined,
        twitterUsername: _collection.twitter_username ?? undefined,
        slug: _collection.slug ?? undefined,
      },
    };

    const { data: selectData, error } = await supabase.from("nft_collections")
      .upsert(collection).select();
    if (error) throw error;

    return selectData[0];
  }
}
