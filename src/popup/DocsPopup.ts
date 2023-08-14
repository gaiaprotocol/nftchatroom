import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-dapp-module";

export default class DocsPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".docs-popup",
        new RetroTitleBar({
          title: "Documentation",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el(
          ".toolbar",
          el("button", "New Window", {
            click: () => window.open("https://docs.nftchatroom.com/"),
          }),
        ),
        el("iframe", { src: "https://docs.nftchatroom.com/" }),
      ),
    );
  }
}
