import {
    Component,
    DomNode,
    el,
    Popup,
    RetroTitleBar,
  } from "common-dapp-module";
  
  export default class AddFavoritePopup extends Popup {
    public content: DomNode;
  
    constructor() {
      super({ barrierDismissible: true });
      this.append(
        this.content = new Component(
          ".add-favorite-popup",
          new RetroTitleBar({
            title: "Add NFT to Favorites",
            buttons: [{
              type: "close",
              click: () => this.delete(),
            }],
          }),
          el("main"),
          el(
            "footer",
            el(
              "button.add-button",
              {
                click: () => {
                  this.delete();
                },
              },
              "Add",
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
  