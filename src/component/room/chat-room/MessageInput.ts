import { DomNode, el } from "common-dapp-module";
import { v4 as uuidv4 } from "uuid";
import SupabaseManager from "../../../SupabaseManager.js";
import AuthManager from "../../../auth/AuthManager.js";
import { MessageType, UploadedFile } from "../../../datamodel/ChatMessage.js";
import NFTCollection from "../../../datamodel/NFTCollection.js";
import RoomProfilePopup from "../../../popup/RoomProfilePopup.js";
import SelectEmojiPopup from "../../../popup/SelectEmojiPopup.js";
import SignInPopup from "../../../popup/SignInPopup.js";
import MessageList from "./MessageList.js";

export default class MessageInput extends DomNode {
  public profile: { pfp?: { image_url?: string } } | undefined;

  constructor(private list: MessageList) {
    super(".message-input");
    this.showMessageBox();
  }

  public showMessageBox() {
    if (AuthManager.signed) {
      let uploadInput: DomNode<HTMLInputElement>;
      let uploadButton: DomNode<HTMLButtonElement>;
      let input: DomNode<HTMLInputElement>;

      this.empty().append(
        this.list.roomId?.includes(":")
          ? el(
            "button.room-profile",
            el("img", { src: "/images/chatroom/profile.png" }),
            { click: () => new RoomProfilePopup(this.list.roomId!) },
          )
          : undefined,
        el("button.emoji", el("img", { src: "/images/chatroom/emoji.png" }), {
          click: () => new SelectEmojiPopup(this.list, this.profile),
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
            click: () => uploadInput.domElement.click(),
          },
        ),
        el(
          "form",
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
          el("button", "Connect Wallet"),
          {
            click: () => new SignInPopup(),
          },
        ),
      );
    }
  }

  private async sendMessage(message: string) {
    if (this.list.roomId && AuthManager.signed) {
      const item = this.list.addItem({
        id: -1,
        author: AuthManager.signed.walletAddress,
        message_type: MessageType.MESSAGE,
        message,
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
            message_type: MessageType.MESSAGE,
            message,
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

  private async sendFile(file: UploadedFile) {
    if (this.list.roomId && AuthManager.signed) {
      const item = this.list.addItem({
        id: -1,
        author: AuthManager.signed.walletAddress,
        message_type: MessageType.FILE_UPLOAD,
        rich: {
          files: [file],
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
            message_type: MessageType.FILE_UPLOAD,
            rich: {
              files: [file],
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

  public setNFTOwned(
    owned: boolean,
    collection?: NFTCollection,
    profile?: any,
  ) {
    this.profile = profile;

    if (owned || !AuthManager.signed) {
      this.showMessageBox();
    } else if (profile === undefined) {
      this.empty().append(
        el(
          ".anonymous-form",
          el("input", {
            disabled: true,
            placeholder: "Please set your room profile.",
          }),
          el("button", "Set Room Profile"),
          {
            click: () => {
              if (this.list.roomId) {
                const popup = new RoomProfilePopup(this.list.roomId);
                popup.on(
                  "save",
                  (newProfile) => {
                    this.setNFTOwned(!!newProfile.pfp, collection, newProfile);
                    this.fireEvent("saveRoomProfile", newProfile);
                  },
                );
              }
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
            placeholder: `You don't own ${collection?.metadata.name} NFT.`,
          }),
          el("button", "Buy NFT"),
          {
            click: () =>
              window.open(
                `https://opensea.io/collection/${collection?.metadata.slug}`,
              ),
          },
        ),
      );
    }
  }
}
