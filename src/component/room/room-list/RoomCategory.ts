import { ArrayUtil, DomNode, el, StringUtil } from "common-dapp-module";
import AuthManager from "../../../auth/AuthManager.js";
import { getRoomId, Room } from "../../../datamodel/Room.js";
import SignInPopup from "../../../popup/user/SignInPopup.js";
import RoomItem from "./RoomItem.js";

export default class RoomCategory extends DomNode {
  private list: DomNode;
  public items: RoomItem[] = [];

  constructor(public category: string, rooms: Room[], loading = false) {
    super("li.room-category");

    const details = el("details", { open: "open" }).appendTo(this);
    details.append(el("summary", StringUtil.toTitleCase(category)));

    this.list = el("ul").appendTo(details);

    if (loading) {
      this.list.append(
        el(
          "li.loading",
          el("img", { src: "/images/loader/small-loader.gif" }),
          "Loading...",
        ),
      );
    }

    for (const room of rooms) {
      this.add(room);
    }

    if (
      AuthManager.signed === undefined &&
      (category === "favorites" || category === "owned")
    ) {
      this.list.append(
        el(
          "li",
          el("a", "Connect Wallet...", {
            click: () => new SignInPopup(),
          }),
        ),
      );
    }
  }

  public add(room: Room) {
    const item = this.items.find((item) =>
      getRoomId(item.room) === getRoomId(room)
    );
    if (!item) {
      const item = new RoomItem(room).appendTo(this.list);
      item.on("select", () => this.fireEvent("select"));
      this.items.push(item);
      return item;
    }
  }

  public remove(roomId: string): void {
    const item = this.items.find((item) => getRoomId(item.room) === roomId);
    if (item) {
      item.delete();
      ArrayUtil.pull(this.items, item);
    }
  }
}
