import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-dapp-module";
import AuthManager from "../auth/AuthManager.js";

export default class MyInfoPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: false });
    this.append(
      this.content = new Component(
        ".my-info-popup",
        new RetroTitleBar({
          title: "My Info",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el("main"),
        el(
          "footer",
          el(
            "button.sign-out-button",
            {
              click: () => {
                AuthManager.signOut();
                this.delete();
              },
            },
            "Sign Out",
          ),
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
