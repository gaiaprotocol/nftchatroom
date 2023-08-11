import { DomNode, el } from "common-dapp-module";
import AuthManager from "../../../AuthManager.js";

export default class MessageInput extends DomNode {
  constructor() {
    super(".message-input");
    this.showMessageBox();
    this.onDelegate(AuthManager, "login", () => this.showMessageBox());
    this.onDelegate(AuthManager, "logout", () => this.showMessageBox());
  }

  private showMessageBox() {
    if (AuthManager.signed) {
      let input: DomNode<HTMLInputElement>;
      this.empty().append(
        el(
          "form",
          input = el("input", {
            placeholder: "Type your message here...",
          }),
          el("button", { type: "submit" }, "Send"),
          {
            submit: (event) => {
              event.preventDefault();
              input.domElement.value = "";
            },
          },
        ),
      );
    } else {
      this.empty().append(
        el(
          ".anonymous-form",
          el("input", {
            disabled: true,
            placeholder: "Please connect wallet to send message.",
          }),
          el("button", "Connect Wallet", {
            click: () => AuthManager.login(),
          }),
        ),
      );
    }
  }
}
