import { DomNode, el } from "common-dapp-module";

export default class UserList extends DomNode {
  constructor() {
    super(".user-list");
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
