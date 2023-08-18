import { DomNode, el, Router } from "common-dapp-module";
import { getRoomId, Room } from "../../../datamodel/Room.js";
import FavoriteManager from "../../../FavoriteManager.js";

export default class RoomItem extends DomNode {
  constructor(public room: Room) {
    super("li.room-item");

    let favoriteCount = room.type === "nft" ? room.favoriteCount : 0;
    let favoriteCountDisplay: DomNode;

    this.append(
      el(
        "a",
        room.type === "nft" && room.metadata.image
          ? el("img", { src: room.metadata.image })
          : undefined,
        el("span.name", room.type === "nft" ? room.metadata.name : room.name),
        room.type === "nft"
          ? el(
            "span.favorite-count",
            el("img", { src: "/images/heart.png" }),
            favoriteCountDisplay = el("span.count", String(favoriteCount)),
          )
          : undefined,
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

    this.onDelegate(FavoriteManager, "addNew", (room: Room) => {
      if (
        getRoomId(room) === getRoomId(this.room) &&
        !favoriteCountDisplay.deleted
      ) {
        favoriteCount += 1;
        favoriteCountDisplay.empty().append(String(favoriteCount));
      }
    });

    this.onDelegate(FavoriteManager, "remove", (roomId: string) => {
      if (roomId === getRoomId(this.room) && !favoriteCountDisplay.deleted) {
        favoriteCount -= 1;
        favoriteCountDisplay.empty().append(String(favoriteCount));
      }
    });
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
