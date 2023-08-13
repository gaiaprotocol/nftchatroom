import { DomNode, el } from "common-dapp-module";
import Constants from "../../Constants.js";
import { Room } from "../../datamodel/Room.js";

export default class RoomInfoComponent extends DomNode {
  constructor() {
    super(".room-info");
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  public set room(room: Room) {
    this.empty();
    if (room.type === "general") {
      const roomInfo = Constants.GENERAL_ROOMS[room.uri];
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
