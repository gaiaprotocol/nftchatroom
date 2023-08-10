import { DomNode, el } from "common-dapp-module";

export default class MessageInput extends DomNode {
  constructor() {
    super(".message-input");
    this.append("Message Input");
  }
}
