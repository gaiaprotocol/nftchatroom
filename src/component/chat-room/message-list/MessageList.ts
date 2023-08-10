import { DomNode, el } from "common-dapp-module";

export default class MessageList extends DomNode {
  constructor() {
    super(".message-list");
  }

  public async loadMessages(roomId: string): Promise<void> {
    //TODO:
    console.log(roomId);
  }
}
