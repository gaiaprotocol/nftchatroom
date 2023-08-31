import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-dapp-module";

export default class DocsPopup extends Popup {
  public content: DomNode;

  constructor(uri?: string) {
    super({ barrierDismissible: true });

    let iframe: DomNode<HTMLIFrameElement>;
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
        iframe = el("iframe.loading", {
          src: "https://docs.nftchatroom.com/" + (uri ?? ""),
        }),
      ),
    );
    iframe.onDom("load", () => iframe.deleteClass("loading"));
  }
}
