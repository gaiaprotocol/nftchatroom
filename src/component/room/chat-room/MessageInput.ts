import { DomNode, el } from "common-dapp-module";
import SupabaseManager from "../../../SupabaseManager.js";
import AuthManager from "../../../auth/AuthManager.js";
import { MessageType } from "../../../datamodel/ChatMessage.js";
import NFTCollection from "../../../datamodel/NFTCollection.js";
import SignInPopup from "../../../popup/SignInPopup.js";
import MessageList from "./MessageList.js";

export default class MessageInput extends DomNode {
  public roomId: string | undefined;

  constructor(private list: MessageList) {
    super(".message-input");
    this.showMessageBox();
    this.onDelegate(AuthManager, "authChanged", () => this.showMessageBox());
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
            click: () => new SignInPopup(),
          }),
        ),
      );
    }
  }

  private async sendMessage(message: string) {
    if (this.roomId && AuthManager.signed) {
      const item = this.list.addItem({
        id: -1,
        author: AuthManager.signed.walletAddress,
        message_type: MessageType.MESSAGE,
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

  public checkingNFTOwned() {
    this.empty().append(
      el(
        ".anonymous-form",
        el("input", {
          disabled: true,
          placeholder: `Verifying if you own this NFT...`,
        }),
      ),
    );
  }

  public setNFTOwned(b: boolean, collection?: NFTCollection) {
    if (b) {
      this.showMessageBox();
    } else {
      this.empty().append(
        el(
          ".anonymous-form",
          el("input", {
            disabled: true,
            placeholder: `You don't own ${collection?.metadata.name} NFT.`,
          }),
          el("button", "Buy NFT", {
            click: () =>
              window.open(
                `https://opensea.io/collection/${collection?.metadata.slug}`,
              ),
          }),
        ),
      );
    }
  }
}
