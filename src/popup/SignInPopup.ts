import {
  Alert,
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
                  await AuthManager.signIn(this.checkbox.checked);
                  this.delete();
                } catch (error) {
                  console.error(error);
                  this.signInButton.domElement.disabled = false;
                  this.signInButton.text = "Sign In";
                }
              },
            },
            "Sign In",
          ),
          el(
            "button.cancel-button",
            { click: () => this.delete() },
            "Cancel",
          ),
        ),
      ),
    );

    this.signInButton.domElement.disabled = !WalletManager.connected;
    this.onDelegate(WalletManager, "accountChanged", () => {
      this.signInButton.domElement.disabled = !WalletManager.connected;
    });

    this.checkbox.on("change", () => {
      if (this.checkbox.checked) {
        new Alert({
          title: "Caution",
          message:
            "By checking the 'Stay Signed In' option, you are allowing this device to remain connected to your crypto wallet on NFTChatRoom.com. This can be convenient but poses a risk if your device is lost, stolen, or accessed by unauthorized individuals. Please ensure the security of your device and consider logging out after each session if using a public or shared computer.",
          confirmTitle: "I Understand",
        });
      }
    });
  }
}
