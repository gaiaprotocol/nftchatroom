import { Component, DomNode, el, Popup } from "common-app-module";

export default class BootingPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: false });
    this.append(
      this.content = new Component(
        ".booting-popup",
        el("img.logo", { src: "/images/text-logo.png" }),
        el(".loading-bar"),
      ),
    );
  }
}
