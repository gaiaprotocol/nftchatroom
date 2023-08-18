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
import AuthManager from "../../auth/AuthManager.js";
import EditMyInfoPopup from "./EditMyInfoPopup.js";

export default class MyInfoPopup extends Popup {
  public content: DomNode;
  private body: DomNode;

  private profile: any | undefined;

  constructor() {
    super({ barrierDismissible: true });
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
        this.body = el("main"),
        el(
          "footer",
          el(
            "button.edit-button",
            {
              click: () => {
                if (this.profile) {
                  this.delete();
                  new EditMyInfoPopup({ ...this.profile });
                }
              },
            },
            "Edit",
          ),
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
    this.load();
  }

  private async load() {
    this.body.empty().append(new RetroLoader());
    if (AuthManager.signed) {
      const response = await get(
        `get-user?wallet_address=${AuthManager.signed.walletAddress}`,
      );
      if (response.status !== 200) {
        console.log(await response.json());
        return;
      }
      const data = await response.json();
      this.profile = data;
      this.body.empty().append(
        el(
          ".pfp",
          data.pfp?.image_url
            ? el("img", { src: data.pfp.image_url })
            : new Jazzicon(AuthManager.signed.walletAddress),
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
            data.ens ? data.ens : AuthManager.signed.walletAddress,
          ),
          data.ens ? el("h2", AuthManager.signed.walletAddress) : undefined,
          el("p", data.introduction ?? "No introduction"),
        ),
      );
    }
  }
}
