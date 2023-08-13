import { DomNode, el } from "common-dapp-module";
import { v4 as uuidv4 } from "uuid";
import SupabaseManager from "../../../SupabaseManager.js";
import AuthManager from "../../../auth/AuthManager.js";
import { MessageType, UploadedFile } from "../../../datamodel/ChatMessage.js";
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
      let uploadInput: DomNode<HTMLInputElement>;
      let uploadButton: DomNode<HTMLButtonElement>;
      let input: DomNode<HTMLInputElement>;

      this.empty().append(
        el(
          "form",
          el("button.emoji", el("img", { src: "/images/chatroom/emoji.png" }), {
            click: (event) => {
              event.preventDefault();
            },
          }),
          uploadInput = el("input.upload", {
            type: "file",
            accept: "image/*",
            change: async (event) => {
              uploadButton.domElement.disabled = true;
              uploadButton.empty().append(
                el("img", { src: "/images/loader/small-loader.gif" }),
              );

              const file = event.target.files?.[0];
              if (AuthManager.signed && file) {
                const { data: uploadData, error: uploadError } =
                  await SupabaseManager.supabase
                    .storage
                    .from("upload_files")
                    .upload(
                      `${AuthManager.signed.walletAddress}/${uuidv4()}_${file.name}`,
                      file,
                    );
                if (uploadError) {
                  console.error(uploadError);
                }
                if (uploadData) {
                  const { data: getURLData, error: getURLError } =
                    await SupabaseManager.supabase
                      .storage
                      .from("upload_files")
                      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7); // 7 days

                  if (getURLError) {
                    console.error(getURLError);
                  }
                  if (getURLData) {
                    console.log(getURLData.signedUrl);

                    const fileInfo: UploadedFile = {
                      url: getURLData.signedUrl,
                      fileName: file.name,
                      fileType: file.type,
                      fileSize: file.size,
                    };

                    const { data: getThumbnailData, error: getThumbnailError } =
                      await SupabaseManager.supabase
                        .storage
                        .from("upload_files")
                        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7, {
                          transform: {
                            width: 32,
                            height: 32,
                          },
                        }); // 7 days
                    if (getThumbnailError) {
                      console.error(getThumbnailError);
                    }

                    if (getThumbnailData) {
                      fileInfo.thumbnailURL = getThumbnailData.signedUrl;
                    }

                    await this.sendFile(fileInfo);
                  }
                }
              }

              uploadInput.domElement.value = "";
              uploadButton.domElement.disabled = false;
              uploadButton.empty().append(
                el("img", { src: "/images/chatroom/upload.png" }),
              );
            },
          }),
          uploadButton = el(
            "button.upload",
            el("img", { src: "/images/chatroom/upload.png" }),
            {
              click: (event) => {
                event.preventDefault();
                uploadInput.domElement.click();
              },
            },
          ),
          input = el("input", {
            placeholder: "Type your message here...",
            autocomplete: "off",
            autocorrect: "off",
            autocapitalize: "off",
            spellcheck: "false",
          }),
          el("button", { type: "submit" }, "Send"),
          {
            submit: (event) => {
              event.preventDefault();
              if (input.domElement.value !== "") {
                this.sendMessage(input.domElement.value);
                input.domElement.value = "";
                if (input.deleted !== true) input.domElement.focus();
              }
            },
          },
        ),
      );
      setTimeout(() => {
        if (input.deleted !== true) input.domElement.focus();
      });
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
            message_type: MessageType.MESSAGE,
            message,
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

  private async sendFile(file: UploadedFile) {
    if (this.roomId && AuthManager.signed) {
      const item = this.list.addItem({
        id: -1,
        author: AuthManager.signed.walletAddress,
        message_type: MessageType.FILE_UPLOAD,
        rich: {
          files: [file],
        },
      });
      item.wait();
      const { data, error } = await SupabaseManager.supabase.from(
        "chat_messages",
      )
        .insert([
          {
            room: this.roomId,
            message_type: MessageType.FILE_UPLOAD,
            rich: {
              files: [file],
            },
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
