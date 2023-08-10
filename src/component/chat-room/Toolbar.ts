import { DomNode, el } from "common-dapp-module";
import WalletManager from "../../WalletManager.js";

export default class Toolbar extends DomNode {
  private roomListButton: DomNode;
  private userListButton: DomNode;

  constructor() {
    super(".toolbar");
    this.append(
      this.roomListButton = el(
        "button",
        el("img", { src: "/images/toolbar/room-list.png" }),
        "Rooms",
        { click: () => this.fireEvent("toggleRoomList") },
      ),
      el(
        "button",
        el("img", { src: "/images/toolbar/connect-wallet.png" }),
        "Connect Wallet",
        { click: () => WalletManager.openModal() },
      ),
      this.userListButton = el(
        "button",
        el("img", { src: "/images/toolbar/user-list.png" }),
        "Users",
        { click: () => this.fireEvent("toggleUserList") },
      ),
    );
  }

  public activateRoomListButton(): void {
    this.roomListButton.addClass("on");
  }

  public deactivateRoomListButton(): void {
    this.roomListButton.deleteClass("on");
  }

  public activateUserListButton(): void {
    this.userListButton.addClass("on");
  }

  public deactivateUserListButton(): void {
    this.userListButton.deleteClass("on");
  }
}