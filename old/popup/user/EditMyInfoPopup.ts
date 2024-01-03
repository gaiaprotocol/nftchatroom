import {
  Component,
  DomNode,
  el,
  Jazzicon,
  Popup,
  RetroTitleBar,
} from "common-app-module";
import { post } from "../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../auth/AuthManager.js";
import SelectPFPPopup from "./SelectPFPPopup.js";

export default class EditMyInfoPopup extends Popup {
  public content: DomNode;
  private pfpWrapper: DomNode;
  private saveButton: DomNode<HTMLButtonElement>;

  constructor(profile: {
    ens?: string;
    introduction?: string;
    pfp?: { image_url?: string };
  }) {
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
        el(
          "main",
          el(
            ".pfp",
            this.pfpWrapper = el(
              ".image-wrapper",
              profile.pfp?.image_url
                ? el("img", { src: profile.pfp.image_url })
                : new Jazzicon(AuthManager.signed!.walletAddress),
              {
                click: () => {
                  const popup = new SelectPFPPopup();
                  popup.on("select", (nft) => {
                    profile.pfp = nft;
                    this.pfpWrapper.empty().append(
                      el("img", { src: nft.image_url }),
                    );
                  });
                },
              },
            ),
            el("button", "Change", {
              click: () => {
                const popup = new SelectPFPPopup();
                popup.on("select", (nft) => {
                  profile.pfp = nft;
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
              profile.ens ? profile.ens : AuthManager.signed!.walletAddress,
            ),
            profile.ens
              ? el("h2", AuthManager.signed!.walletAddress)
              : undefined,
            el("textarea", profile.introduction ?? "", {
              placeholder: "Introduction",
              keyup: (event) => {
                profile.introduction = event.target.value;
              },
            }),
          ),
        ),
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
                    introduction: profile.introduction,
                    pfp: profile.pfp,
                  });
                  AuthManager.setUserInfo(profile);
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
  }
}
