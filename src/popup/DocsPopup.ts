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
          "header",
          el("button", "New Window", {
            click: () => window.open("http://docs.nftchatroom.com/"),
          }),
        ),
        el("iframe", { src: "http://docs.nftchatroom.com/" }),
      ),
    );
  }
}
