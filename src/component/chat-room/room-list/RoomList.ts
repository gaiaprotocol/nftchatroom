import { DomNode, el } from "common-dapp-module";

export default class RoomList extends DomNode {
  constructor() {
    super(".room-list");
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
