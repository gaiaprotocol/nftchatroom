import { DomNode, el, RetroLoader } from "common-dapp-module";
import { get } from "../../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../../AuthManager.js";
import { Room } from "../../../Room.js";
import WalletManager from "../../../WalletManager.js";
import RoomCategory from "./RoomCategory.js";
import RoomItem from "./RoomItem.js";

export default class RoomList extends DomNode {
  private _currentRoom?: Room;

  private categories: RoomCategory[] = [];
  private currentRoomItems: RoomItem[] = [];

  constructor() {
    super(".room-list");
    this.loadRooms();
    this.onDelegate(AuthManager, "login", () => this.loadRooms());
    this.onDelegate(AuthManager, "logout", () => this.loadRooms());
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  private async loadRooms(): Promise<void> {
    this.categories = [];

    this.empty().append(new RetroLoader());
    const roomsResponse = await get(
      `get-rooms?wallet_address=${WalletManager.address}`,
    );
    const roomsData: { [category: string]: Room[] } = await roomsResponse
      .json();
    this.empty();

    const container = el("ul.container").appendTo(this);
    for (const [category, rooms] of Object.entries(roomsData)) {
      const categoryNode = new RoomCategory(category, rooms).appendTo(
        container,
      );
      categoryNode.on("select", () => this.fireEvent("select"));
      this.categories.push(categoryNode);
    }

    if (this._currentRoom) {
      this.currentRoom = this._currentRoom;
    }
  }

  public set currentRoom(room: Room) {
    this._currentRoom = room;

    for (const roomItem of this.currentRoomItems) {
      roomItem.inactive();
    }
    this.currentRoomItems = [];

    for (const category of this.categories) {
      for (const roomItem of category.items) {
        if (
          roomItem.room.type === room.type && ((
            room.type === "general" &&
            room.uri === (roomItem.room as any).uri
          ) || (
            room.type === "nft" &&
            room.chain === (roomItem.room as any).chain &&
            room.address === (roomItem.room as any).address
          ))
        ) {
          roomItem.active();
          this.currentRoomItems.push(roomItem);
        }
      }
    }
  }
}
