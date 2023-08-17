import { DomNode, el, Router } from "common-dapp-module";
import { Room } from "../../../datamodel/Room.js";

export default class RoomItem extends DomNode {
  constructor(public room: Room) {
    super("li.room-item");
    this.append(
      el(
        "a",
        room.type === "nft" && room.metadata.image
          ? el("img", { src: room.metadata.image })
          : undefined,
        room.type === "nft" ? room.metadata.name : room.name,
        {
          click: () => {
            if (room.type === "general") {
              Router.go(`/${room.uri}`);
            } else {
              Router.go(`/${room.nft.split(":").join("/")}`);
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
