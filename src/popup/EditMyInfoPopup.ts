import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-dapp-module";

export default class EditMyInfoPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".edit-my-info-popup",
        new RetroTitleBar({
          title: "Edit My Info",
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
