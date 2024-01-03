import NFTCollection from "./NFTCollection.js";

export interface GeneralRoom {
  type: "general";
  name?: string;
  uri: string;
}

export interface NFTRoom extends NFTCollection {
  type: "nft";
}

export type Room = GeneralRoom | NFTRoom;

export function getRoomId(room: Room) {
  return room.type === "general" ? room.uri : room.nft;
}
