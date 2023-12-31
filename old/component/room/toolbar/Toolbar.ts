import { DomNode, el } from "common-app-module";
import DocsPopup from "../../../popup/common/DocsPopup.js";
import SettingPopup from "../../../popup/common/SettingPopup.js";
import ConnectWalletButton from "./ConnectWalletButton.js";

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
      new ConnectWalletButton(),
      el(
        "button",
        el("img", { src: "/images/toolbar/docs.png" }),
        "Docs",
        { click: () => new DocsPopup() },
      ),
      el(
        "button",
        el("img", { src: "/images/toolbar/settings.png" }),
        "Settings",
        { click: () => new SettingPopup() },
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
