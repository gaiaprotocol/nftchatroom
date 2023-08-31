import { Alert, DomNode, el, Store } from "common-dapp-module";

export default class SettingComponent extends DomNode {
  private settingStore: Store = new Store("setting");

  private currentZoomDisplay: DomNode;

  constructor() {
    super(".settings");

    this.append(
      el(
        ".zoom-setting",
        el("label", "Zoom:"),
        el("label", "1"),
        el("input", {
          type: "range",
          min: 1,
          max: 3,
          step: 0.1,
          value: this.settingStore.get("zoom") ?? 1,
          touchstart: (event) => event.stopPropagation(),
          input: (event) => this.currentZoomDisplay.text = event.target.value,
          change: (event) => {
            document.documentElement.style.setProperty(
              "zoom",
              event.target.value,
            );
            this.settingStore.set("zoom", event.target.value);
            if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
              new Alert({
                title: "Warning",
                message: "Firefox does not support zooming.",
                confirmTitle: "OK",
              });
            }
          },
        }),
        el("label", "3"),
        el(
          "label",
          "(Current Zoom: ",
          this.currentZoomDisplay = el(
            "span",
            this.settingStore.get("zoom") ?? "1",
          ),
          ")",
        ),
      ),
    );
  }
}
