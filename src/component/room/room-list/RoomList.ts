import { DomNode, el, RetroLoader } from "common-dapp-module";
import { get } from "../../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../../auth/AuthManager.js";
import { Room } from "../../../datamodel/Room.js";
import FavoriteManager from "../../../FavoriteManager.js";
import AddFavoritePopup from "../../../popup/AddFavoritePopup.js";
import RoomCategory from "./RoomCategory.js";
import RoomItem from "./RoomItem.js";

export default class RoomList extends DomNode {
  private _currentRoom?: Room;

  private categories: RoomCategory[] = [];
  private currentRoomItems: RoomItem[] = [];

  constructor() {
    super(".room-list");
    this.loadRooms();
    this.onDelegate(AuthManager, "authChanged", () => this.loadRooms());
    this.onDelegate(
      FavoriteManager,
      "add",
      (room: Room) => {
        const item = this.categories.find((c) => c.category === "favorites")
          ?.add(room);
        if (item) {
          if (
            this._currentRoom?.type === room.type && ((
              room.type === "general" &&
              room.uri === (this._currentRoom as any).uri
            ) || (
              room.type === "nft" &&
              room.chain === (this._currentRoom as any).chain &&
              room.address === (this._currentRoom as any).address
            ))
          ) {
            item.active();
            this.currentRoomItems.push(item);
          }
        }
      },
    );
    this.onDelegate(
      FavoriteManager,
      "remove",
      (roomId: string) =>
        this.categories.find((c) => c.category === "favorites")?.remove(
          roomId,
        ),
    );
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  private async loadRooms(): Promise<void> {
    this.categories = [];
    FavoriteManager.clear();

    this.empty().append(new RetroLoader());
    const roomsResponse = await get(
      AuthManager.signed === undefined
        ? "get-rooms"
        : `get-rooms?token=${AuthManager.signed.token}`,
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

      if (category === "favorites") {
        for (const room of rooms) {
          FavoriteManager.add(room);
        }
      }
    }

    if (this._currentRoom) {
      this.currentRoom = this._currentRoom;
    }

    el(
      "button.add-favorite",
      "Add NFT to Favorites",
      {
        click: () => new AddFavoritePopup(),
      },
    ).appendTo(this);
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
