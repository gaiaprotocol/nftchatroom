import { DomNode, el } from "common-dapp-module";
import WalletManager from "../../WalletManager.js";

export default class Toolbar extends DomNode {
  constructor() {
    super(".toolbar");
    this.append(
      el(
        "button.on",
        el("img", { src: "/images/toolbar/room-list.png" }),
        "Rooms",
      ),
      el(
        "button",
        el("img", { src: "/images/toolbar/connect-wallet.png" }),
        "Connect Wallet",
        { click: () => WalletManager.openModal() },
      ),
      el(
        "button.on",
        el("img", { src: "/images/toolbar/user-list.png" }),
        "Users",
      ),
    );
  }
}
