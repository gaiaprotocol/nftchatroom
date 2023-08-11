import { DomNode, el } from "common-dapp-module";
import AuthManager from "../../../AuthManager.js";
import SupabaseManager from "../../../SupabaseManager.js";
import WalletManager from "../../../WalletManager.js";
import MessageList from "./MessageList.js";

export default class MessageInput extends DomNode {
  public roomId: string | undefined;

  constructor(private list: MessageList) {
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
              this.sendMessage(input.domElement.value);
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

  private async sendMessage(message: string) {
    if (this.roomId && WalletManager.address) {
      const item = this.list.addItem({
        id: -1,
        author: WalletManager.address,
        message,
      });
      item.wait();
      const { data, error } = await SupabaseManager.supabase.from(
        "chat_messages",
      )
        .insert([
          {
            room: this.roomId,
            message,
          },
        ]).select();
      if (data?.[0]) {
        const id = data[0].id;
        this.list.findItem(id)?.delete();
        item.message.id = id;
        item.done();
      }
    }
  }
}
