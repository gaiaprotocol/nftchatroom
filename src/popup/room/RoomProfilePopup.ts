import {
  Component,
  DomNode,
  el,
  Popup,
  RetroLoader,
  RetroTitleBar,
} from "common-dapp-module";
import { get, post } from "../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../auth/AuthManager.js";
import SelectPFPPopup from "../user/SelectPFPPopup.js";

export default class RoomProfilePopup extends Popup {
  public content: DomNode;
  private body: DomNode;
  private pfpWrapper!: DomNode;
  private saveButton: DomNode<HTMLButtonElement>;

  private roomProfile: any | undefined;

  constructor(private roomId: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".room-profile-popup",
        new RetroTitleBar({
          title: "Room Profile",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        this.body = el("main"),
        el(
          "footer",
          this.saveButton = el(
            "button.save-button",
            {
              click: async () => {
                if (AuthManager.signed) {
                  this.saveButton.domElement.disabled = true;
                  this.saveButton.text = "Saving...";
                  await post("set-profile", {
                    token: AuthManager.signed.token,
                    room: roomId,
                    pfp: this.roomProfile.pfp,
                  });
                  this.fireEvent("save", this.roomProfile);
                  this.delete();
                }
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
    this.load();
  }

  private async load() {
    this.body.empty().append(new RetroLoader());
    this.saveButton.domElement.disabled = true;

    if (AuthManager.signed) {
      const response = await get(
        `get-user?wallet_address=${AuthManager.signed.walletAddress}&room=${this.roomId}`,
      );
      if (response.status !== 200) {
        console.log(await response.json());
        return;
      }
      this.roomProfile = await response.json();

      this.body.empty().append(
        el(
          ".pfp",
          this.pfpWrapper = el(
            ".image-wrapper",
            this.roomProfile.pfp?.image_url
              ? el("img", { src: this.roomProfile.pfp.image_url })
              : el("button.no-pfp", "Select a PFP"),
            {
              click: () => {
                const popup = new SelectPFPPopup(this.roomId);
                popup.on("select", (nft) => {
                  this.roomProfile.pfp = nft;
                  this.pfpWrapper.empty().append(
                    el("img", { src: nft.image_url }),
                  );
                  this.saveButton.domElement.disabled = !this.roomProfile.pfp
                    ?.image_url;
                });
              },
            },
          ),
          el("button", this.roomProfile.pfp?.image_url ? "Change" : "Select", {
            click: () => {
              const popup = new SelectPFPPopup(this.roomId);
              popup.on("select", (nft) => {
                this.roomProfile.pfp = nft;
                this.pfpWrapper.empty().append(
                  el("img", { src: nft.image_url }),
                );
              });
            },
          }),
        ),
        el(
          ".info",
          el(
            "h1",
            this.roomProfile.ens
              ? this.roomProfile.ens
              : AuthManager.signed.walletAddress,
          ),
          this.roomProfile.ens
            ? el("h2", AuthManager.signed.walletAddress)
            : undefined,
          el("p", this.roomProfile.introduction ?? "No introduction"),
        ),
      );

      if (this.roomProfile.pfp?.image_url) {
        this.saveButton.domElement.disabled = false;
      }
    }
  }
}
