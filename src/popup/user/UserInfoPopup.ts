import {
  Component,
  DomNode,
  el,
  Jazzicon,
  Popup,
  RetroLoader,
  RetroTitleBar,
} from "common-dapp-module";
import { get } from "../../_shared/edgeFunctionFetch.js";

export default class UserInfoPopup extends Popup {
  public content: DomNode;
  private body: DomNode;

  constructor(private walletAddress: string, private room: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".user-info-popup",
        new RetroTitleBar({
          title: "User Info",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        this.body = el("main"),
        el(
          "footer",
          el(
            "button.confirm-button",
            { click: () => this.delete() },
            "OK",
          ),
        ),
      ),
    );
    this.load();
  }

  private async load() {
    this.body.empty().append(new RetroLoader());
    const response = await get(
      this.room.includes(":")
        ? `get-user-info?wallet_address=${this.walletAddress}&room=${this.room}`
        : `get-user-info?wallet_address=${this.walletAddress}`,
    );
    if (response.status !== 200) {
      console.log(await response.json());
      return;
    }
    const data = await response.json();
    this.body.empty().append(
      el(
        ".pfp",
        data.pfp?.image_url
          ? el("img", { src: data.pfp.image_url })
          : new Jazzicon(this.walletAddress),
        !data.pfp ? undefined : el("button", "OpenSea", {
          click: () =>
            window.open(
              `https://opensea.io/assets/${data.pfp.chain}/${data.pfp.address}/${data.pfp.token_id}`,
            ),
        }),
      ),
      el(
        ".info",
        el(
          "h1",
          data.ens ? data.ens : this.walletAddress,
        ),
        data.ens ? el("h2", this.walletAddress) : undefined,
        el("p", data.introduction ?? "No introduction"),
      ),
    );
  }
}
