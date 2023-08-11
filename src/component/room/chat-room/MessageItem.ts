import { DomNode, el, Jazzicon, StringUtil } from "common-dapp-module";
import ChatMessage from "../../../datamodel/ChatMessage.js";

export default class MessageItem extends DomNode {
  constructor(public message: ChatMessage) {
    super("li.message-item");
    this.append(
      el(
        "span.author",
        new Jazzicon(message.author),
        StringUtil.shortenEthereumAddress(message.author),
        ":",
      ),
      el("span.message", message.message),
    );
  }

  public wait() {
    this.addClass("wait");
  }

  public done() {
    this.deleteClass("wait");
  }
}
