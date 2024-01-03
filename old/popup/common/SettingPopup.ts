import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
} from "common-app-module";
import SettingComponent from "../../component/SettingComponent.js";

export default class SettingPopup extends Popup {
  public content: DomNode;

  constructor() {
    super({ barrierDismissible: false });
    this.append(
      this.content = new Component(
        ".setting-popup",
        new RetroTitleBar({
          title: "Settings",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el(
          "main",
          new SettingComponent(),
        ),
        el(
          "footer",
          el(
            "button.save-button",
            {
              click: async () => {
              },
            },
            "Save",
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
