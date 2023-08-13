import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-dapp-module";

export default class UserInfoPopup extends Popup {
  public content: DomNode;

  constructor(walletAddress: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".user-info-popup",
        new RetroTitleBar({
          title: "User Info",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el("main"),
        el(
          "footer",
          el(
            "button.confirm-button",
            { click: () => this.delete() },
            "OK",
          ),
        ),
      ),
    );
  }
}
