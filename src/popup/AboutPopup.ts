import {
  Component,
  DomNode,
  el,
  Popup,
  RetroStatusBar,
  RetroTitleBar,
} from "common-dapp-module";

export default class AboutPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: false });
    this.append(
      this.content = new Component(
        ".about-popup",
        new RetroTitleBar({
          title: "About NFTChatRoom.com",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el(
          "main",
          el("img", { src: "/images/logo.png" }),
          el(
            "p",
            el("img", { src: "/images/text-logo.png" }),
            "NFTChatRoom.com is a gathering space for all NFT collection holders to come and chat.\nWAGMI!\n",
            el("a", "Twitter >> https://twitter.com/nftchatroom", {
              target: "_blank",
              href: "https://twitter.com/nftchatroom",
            }),
          ),
        ),
        el(
          "footer",
          el(
            "button.confirm-button",
            { click: () => this.delete() },
            "OK",
          ),
        ),
        new RetroStatusBar({
          statuses: [
            [
              "BUIDL by ",
              el("a", "Gaia Protocol", {
                target: "_blank",
                href: "https://gaiaprotocol.com",
              }),
            ],
            "Stay Positive",
            "Stage: Beta",
          ],
        }),
      ),
    );
  }
}
