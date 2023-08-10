import { DomNode, el, View, ViewParams } from "common-dapp-module";
import ChatRoom from "../component/chat-room/ChatRoom.js";
import Layout from "./Layout.js";

export default class ChatRoomView extends View {
  private container: DomNode;
  private chatRoom: ChatRoom;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(".chat-room-view", this.chatRoom = new ChatRoom()),
    );
    if (params.uri) {
      this.enterGeneralRoom(params.uri);
    } else if (params.chain && params.address) {
      this.enterNFTRoom(params.chain, params.address);
    } else {
      this.enterGeneralRoom("general");
    }
  }

  public changeParams(params: ViewParams): void {
    if (params.uri) {
      this.enterGeneralRoom(params.uri);
    } else if (params.chain && params.address) {
      this.enterNFTRoom(params.chain, params.address);
    } else {
      this.enterGeneralRoom("general");
    }
  }

  private enterGeneralRoom(uri: string) {
    this.chatRoom.room = { type: "general", uri };
  }

  private enterNFTRoom(chain: string, address: string) {
    this.chatRoom.room = { type: "nft", chain, address };
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
