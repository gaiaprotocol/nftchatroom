import {
  Component,
  DomNode,
  el,
  Popup,
  RetroLoader,
  RetroTitleBar,
} from "common-app-module";
import { get } from "../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../auth/AuthManager.js";

export default class SelectPFPPopup extends Popup {
  public content: DomNode;
  private body: DomNode;

  constructor(private room?: string) {
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
        this.body = el("main"),
        el(
          "footer",
          el(
            "button.cancel-button",
            { click: () => this.delete() },
            "Cancel",
          ),
        ),
      ),
    );
    this.load();
  }

  private async load() {
    this.body.empty().append(new RetroLoader());
    if (AuthManager.signed) {
      const response = await get(
        this.room
          ? `get-nfts?wallet_address=${AuthManager.signed.walletAddress}&room=${this.room}`
          : `get-nfts?wallet_address=${AuthManager.signed.walletAddress}`,
      );
      if (response.status !== 200) {
        console.log(await response.json());
        return;
      }
      const data: any[] = await response.json();
      this.body.empty();
      if (data.length === 0) {
        this.body.append(el("p", "No NFTs found."));
      }
      for (const nft of data) {
        const img = el<HTMLImageElement>("img.loading", {
          src: nft.image_url,
          loading: "lazy",
        });
        img.domElement.onload = () => img.deleteClass("loading");
        this.body.append(
          el(
            "button.nft",
            img,
            {
              click: () => {
                this.fireEvent("select", nft), this.delete();
              },
            },
          ),
        );
      }
    }
  }
}
