export interface GeneralRoom {
  type: "general";
  name?: string;
  uri: string;
}

export interface NFTRoom {
  type: "nft";
  icon?: string;
  name?: string;
  chain: string;
  address: string;
}

export type Room = GeneralRoom | NFTRoom;
