import { DomNode, Store } from "common-dapp-module";
import MessageInput from "./MessageInput.js";
import MessageList from "./MessageList.js";

export default class ChatRoom extends DomNode {
  private settingStore: Store = new Store("setting");

  private messageList: MessageList;
  private messageInput: MessageInput;

  constructor() {
    super(".chat-room");
    this.append(
      this.messageList = new MessageList(),
      this.messageInput = new MessageInput(this.messageList),
    );
  }

  public set roomId(roomId: string | undefined) {
    this.messageList.roomId = roomId;
    this.messageInput.roomId = roomId;
  }
}
