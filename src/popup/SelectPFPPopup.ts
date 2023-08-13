import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-dapp-module";

export default class SelectPFPPopup extends Popup {
  public content: DomNode;

  constructor(collection?: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".select-pfp-popup",
        new RetroTitleBar({
          title: "Select Profile Picture",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el("main"),
        el(
          "footer",
          el(
            "button.save-button",
            {
              click: () => {
                this.delete();
              },
            },
            "Save",
          ),
          el(
            "button.cancel-button",
            { click: () => this.delete() },
            "Cancel",
          ),
        ),
      ),
    );
  }
}
