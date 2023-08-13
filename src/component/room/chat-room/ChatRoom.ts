import { DomNode, el } from "common-dapp-module";
import Constants from "../../../Constants.js";
import NFTCollection from "../../../datamodel/NFTCollection.js";
import Tabs from "../tab/Tabs.js";
import FavoriteButton from "./FavoriteButton.js";
import MessageInput from "./MessageInput.js";
import MessageList from "./MessageList.js";

export default class ChatRoom extends DomNode {
  private header: DomNode;
  private roomTitle: DomNode;
  private favoriteButton: FavoriteButton | undefined;
  private messageList: MessageList;
  private messageInput: MessageInput;

  constructor() {
    super(".chat-room");
    this.append(
      this.header = el(
        "header",
        this.roomTitle = el("h1"),
        new Tabs([
          { label: "Info", active: false },
          { label: "ChatRoom", active: true },
        ]),
      ),
      this.messageList = new MessageList(),
      this.messageInput = new MessageInput(this.messageList),
    );
  }

  public set roomId(roomId: string | undefined) {
    this.favoriteButton?.delete();
    this.favoriteButton = undefined;

    this.messageList.roomId = roomId;

    this.roomTitle.empty();
    if (roomId) {
      const roomInfo = Constants.GENERAL_ROOMS[roomId];
      if (roomInfo) {
        this.roomTitle.text = roomInfo.name;
      }
    }

    if (roomId?.includes(":")) {
      this.favoriteButton = new FavoriteButton(roomId);
      this.header.append(this.favoriteButton);
    }
  }

  public checkingNFTOwned() {
    this.messageInput.checkingNFTOwned();
    this.roomTitle.text = "Loading...";
  }

  public setNFTOwned(b: boolean, collection?: NFTCollection) {
    this.messageInput.setNFTOwned(b, collection);
    if (collection?.metadata) {
      this.roomTitle.empty().append(
        !collection.metadata.image
          ? undefined
          : el("img", { src: collection.metadata.image }),
        collection.metadata.name,
      );
    }
  }
}
