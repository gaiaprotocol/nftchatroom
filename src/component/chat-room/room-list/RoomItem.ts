import { DomNode, el, Router } from "common-dapp-module";
import { Room } from "../../../Room.js";

export default class RoomItem extends DomNode {
  constructor(public room: Room) {
    super("li.room-item");
    this.append(
      el(
        "a",
        room.type === "nft" && room.icon
          ? el("img", { src: room.icon })
          : undefined,
        room.name,
        {
          click: () => {
            if (room.type === "general") {
              Router.go(`/${room.uri}`);
            } else {
              Router.go(`/${room.chain}/${room.address}`);
            }
            this.fireEvent("select");
          },
        },
      ),
    );
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
