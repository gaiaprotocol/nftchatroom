import { DomNode, el } from "common-app-module";
import { Room } from "../datamodel/Room.js";
import general_rooms from "../general_rooms.js";

export default class RoomInfoDisplay extends DomNode {
  constructor(room: Room) {
    super(".room-info");
    if (room.type === "general") {
      const roomInfo = general_rooms[room.uri];
      if (roomInfo) {
        this.append(
          el("h1", roomInfo.name),
          el("p", roomInfo.description),
        );
      }
    } else if (room.type === "nft") {
      this.append(
        !room.metadata.bannerImage
          ? undefined
          : el("img.banner", { src: room.metadata.bannerImage }),
        !room.metadata.image
          ? undefined
          : el("img.icon", { src: room.metadata.image }),
        !room.metadata.image ? undefined : el("h1", room.metadata.name),
        !room.metadata.description
          ? undefined
          : el("p", room.metadata.description),
        el(
          "footer",
          !room.metadata.slug ? undefined : el("button", "OpenSea", {
            click: () =>
              window.open(
                `https://opensea.io/collection/${room.metadata.slug}`,
              ),
          }),
          !room.metadata.externalLink ? undefined : el("button", "Website", {
            click: () => window.open(room.metadata.externalLink),
          }),
          !room.metadata.discordURL ? undefined : el("button", "Discord", {
            click: () => window.open(room.metadata.discordURL),
          }),
          !room.metadata.telegramURL ? undefined : el("button", "Telegram", {
            click: () => window.open(room.metadata.telegramURL),
          }),
          !room.metadata.twitterUsername ? undefined : el("button", "Twitter", {
            click: () =>
              window.open(
                `https://twitter.com/${room.metadata.twitterUsername}`,
              ),
          }),
        ),
      );
    }
  }
}
