import {
  Component,
  DomNode,
  el,
  Popup,
  RetroStatusBar,
  RetroTitleBar,
} from "common-dapp-module";

export default class AboutNFTChatRoomPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".about-nft-chat-room-popup",
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
            "NFTChatRoom.com is a gathering space for all NFT collection holders to come and chat.\nWAGMI!",
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
            "BUIDL by Gaia Protocol",
            "Stay Positive",
            "Stage: Beta",
          ],
        }),
      ),
    );
  }
}
