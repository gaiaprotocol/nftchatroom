export interface GeneralRoom {
  type: "general";
  name?: string;
  uri: string;
}

export interface NFTRoom {
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

export type Room = GeneralRoom | NFTRoom;
