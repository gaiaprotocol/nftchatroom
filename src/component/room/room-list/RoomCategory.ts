import { DomNode, el, StringUtil } from "common-dapp-module";
import AuthManager from "../../../auth/AuthManager.js";
import SignInPopup from "../../../popup/SignInPopup.js";
import { Room } from "../../../datamodel/Room.js";
import RoomItem from "./RoomItem.js";

export default class RoomCategory extends DomNode {
  public items: RoomItem[] = [];

  constructor(category: string, rooms: Room[]) {
    super("li.room-category");

    const details = el("details", { open: "open" }).appendTo(this);
    details.append(el("summary", StringUtil.toTitleCase(category)));

    const list = el("ul").appendTo(details);
    for (const room of rooms) {
      const item = new RoomItem(room).appendTo(list);
      item.on("select", () => this.fireEvent("select"));
      this.items.push(item);
    }
    if (
      AuthManager.signed === undefined &&
      (category === "favorites" || category === "owned")
    ) {
      list.append(
        el(
          "li",
          el("a", "Connect Wallet...", {
            click: () => new SignInPopup(),
          }),
        ),
      );
    }
  }
}
