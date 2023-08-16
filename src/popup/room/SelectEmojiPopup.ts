import {
  Component,
  DomNode,
  el,
  Popup,
  RetroTitleBar,
  Store,
} from "common-dapp-module";
import AuthManager from "../../auth/AuthManager.js";
import MessageList from "../../component/room/chat-room/MessageList.js";
import { MessageType } from "../../datamodel/ChatMessage.js";
import OpenMoji from "../../openmoji/OpenMoji.js";
import SupabaseManager from "../../SupabaseManager.js";

export default class SelectEmojiPopup extends Popup {
  private settingStore = new Store("select-emoji-popup-setting");

  public content: DomNode;
  private sendButton: DomNode<HTMLButtonElement>;
  private selectedEmojiButton: DomNode<HTMLButtonElement> | undefined;

  private selectedEmoji: string | undefined;

  constructor(private list: MessageList, private profile?: any) {
    super({ barrierDismissible: false });

    let main;
    this.append(
      this.content = new Component(
        ".select-emoji-popup",
        new RetroTitleBar({
          title: "Select Emoji to Send",
          buttons: [{
            type: "close",
            click: () => this.delete(),
          }],
        }),
        main = el(
          "main",
          ...OpenMoji.list.map((o) => {
            const img = el<HTMLImageElement>("img.loading", {
              src: OpenMoji.getEmojiURL(o),
              loading: "lazy",
            });
            const button = el<HTMLButtonElement>("button", img as any, {
              click: () => {
                if (this.selectedEmojiButton === button) {
                  this.selectedEmojiButton?.deleteClass("selected");
                  this.selectedEmojiButton = undefined;
                  this.selectedEmoji = undefined;
                  this.sendButton.domElement.disabled = true;
                  return;
                }
                this.selectedEmojiButton?.deleteClass("selected");
                this.selectedEmojiButton = button;
                this.selectedEmojiButton.addClass("selected");
                this.selectedEmoji = o;
                this.sendButton.domElement.disabled = false;
              },
            });
            img.domElement.onload = () => img.deleteClass("loading");
            return button;
          }),
          {
            scroll: (event) => {
              const target = event.target as HTMLElement;
              this.settingStore.set("scrollTop", target.scrollTop, true);
            },
          },
        ),
        el(
          "footer",
          this.sendButton = el<HTMLButtonElement>(
            "button.send-button",
            {
              click: async () => {
                if (!this.selectedEmoji) {
                  return;
                }
                try {
                  this.sendButton.domElement.disabled = true;
                  this.sendButton.text = "Sending...";
                  await this.sendEmoji(this.selectedEmoji);
                  this.delete();
                } catch (error) {
                  console.error(error);
                  this.sendButton.domElement.disabled = false;
                  this.sendButton.text = "Send";
                }
              },
            },
            "Send",
          ),
          el(
            "button.cancel-button",
            { click: () => this.delete() },
            "Cancel",
          ),
        ),
      ),
    );

    this.sendButton.domElement.disabled = true;

    if (this.settingStore.get("scrollTop")) {
      main.domElement.scrollTop = this.settingStore.get("scrollTop")!;
    }
  }

  private async sendEmoji(emoji: string) {
    if (AuthManager.signed) {
      const item = this.list.addItem({
        id: -1,
        author: AuthManager.signed.walletAddress,
        message_type: MessageType.EMOJI,
        rich: {
          emojis: [`openmoji:${emoji}`],
        },
        author_ens: AuthManager.signed.user?.ens,
        author_pfp: this.profile?.pfp,
      });
      item.wait();
      const { data, error } = await SupabaseManager.supabase.from(
        "chat_messages",
      )
        .insert([
          {
            room: this.list.roomId,
            message_type: MessageType.EMOJI,
            rich: {
              emojis: [`openmoji:${emoji}`],
            },
            author_ens: AuthManager.signed.user?.ens,
            author_pfp: this.profile?.pfp,
          },
        ]).select();
      if (error) {
        console.error(error);
      }
      if (data?.[0]) {
        const id = data[0].id;
        this.list.findItem(id)?.delete();
        item.message.id = id;
        item.done();
      }
    }
  }
}
