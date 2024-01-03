import { DomNode, el, Jazzicon, StringUtil } from "common-app-module";
import ChatMessage, { UploadedFile } from "../../../datamodel/ChatMessage.js";
import OpenMoji from "../../../openmoji/OpenMoji.js";
import UserDropdownMenu from "../../UserDropdownMenu.js";

export default class MessageItem extends DomNode {
  constructor(room: string, public message: ChatMessage) {
    super("li.message-item");
    this.append(
      el(
        "a.author",
        message.author_pfp?.image_url
          ? el("img", { src: message.author_pfp.image_url })
          : new Jazzicon(message.author),
        message.author_ens
          ? message.author_ens
          : StringUtil.shortenEthereumAddress(message.author),
        ":",
        {
          click: (event) => {
            event.stopPropagation();
            new UserDropdownMenu(
              event.clientX,
              event.clientY,
              message.author,
              room,
            );
          },
        },
      ),
      !message.message ? undefined : el("span.message", message.message),
      !message.rich ? undefined : this.getRich(message.rich),
    );
  }

  private getRich(rich: {
    files?: UploadedFile[];
    emojis?: string[];
  }) {
    if (rich.files) {
      return el(
        "div.files",
        ...rich.files.map((file) =>
          el(
            "div.file",
            el("a", { href: file.url, target: "_blank" }, file.fileName),
            " ",
            el("span.file-size", `(${file.fileSize} bytes)`),
            ...(!file.thumbnailURL ? [] : [
              "\n",
              el("a", el("img", { src: file.thumbnailURL }), {
                href: file.url,
                target: "_blank",
              }),
            ]),
          )
        ),
      );
    }
    if (rich.emojis) {
      return el(
        "div.emojis",
        ...rich.emojis.map((emoji) =>
          el("img.emoji", {
            src: OpenMoji.getEmojiURL(emoji.substring(emoji.indexOf(":") + 1)),
          })
        ),
      );
    }
    return undefined;
  }

  public wait() {
    this.addClass("wait");
  }

  public done() {
    this.deleteClass("wait");
  }
}
