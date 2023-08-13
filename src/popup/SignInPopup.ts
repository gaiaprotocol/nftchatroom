import {
  Component,
  DomNode,
  el,
  Popup,
  RetroCheckbox,
  RetroTitleBar,
} from "common-dapp-module";
import AuthManager from "../auth/AuthManager.js";
import WalletManager from "../auth/WalletManager.js";

export default class SignInPopup extends Popup {
  public content: DomNode;
  private checkbox: RetroCheckbox;
  private signInButton: DomNode<HTMLButtonElement>;
  private okButton: DomNode<HTMLButtonElement>;

  constructor() {
    super({ barrierDismissible: false });
    this.append(
      this.content = new Component(
        ".sign-in-popup",
        new RetroTitleBar({
          title: "Sign In to NFTChatRoom.com",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        el(
          "main",
          el("img", { src: "/images/logo.png" }),
          el(
            "p",
            "To sign in to NFTChatRoom.com, please follow the steps below:",
            el(
              "ol",
              el(
                "li",
                "Connect with your crypto wallet.\n\n",
                el("w3m-core-button"),
              ),
              el(
                "li",
                "Click the \"Sign In\" button. If you wish to stay signed in on this device, please check the 'Stay Signed In' checkbox.",
              ),
            ),
            this.checkbox = new RetroCheckbox({ label: "Stay Signed In" }),
          ),
        ),
        el(
          "footer",
          this.signInButton = el<HTMLButtonElement>(
            "button.sign-in-button",
            {
              click: async () => {
                try {
                  this.signInButton.domElement.disabled = true;
                  this.signInButton.text = "Signing In...";
                  this.okButton.domElement.disabled = true;
                  await AuthManager.signIn(this.checkbox.checked);
                  this.delete();
                } catch (error) {
                  console.error(error);
                  this.signInButton.domElement.disabled = false;
                  this.signInButton.text = "Sign In";
                  this.okButton.domElement.disabled = false;
                }
              },
            },
            "Sign In",
          ),
          this.okButton = el(
            "button.confirm-button",
            { click: () => this.delete() },
            "OK",
          ),
        ),
      ),
    );

    this.signInButton.domElement.disabled = !WalletManager.connected;
    this.onDelegate(WalletManager, "accountChanged", () => {
      this.signInButton.domElement.disabled = !WalletManager.connected;
    });
  }
}
