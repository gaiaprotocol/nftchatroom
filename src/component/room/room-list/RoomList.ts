import { DomNode, el } from "common-dapp-module";
import FavoriteManager from "../../../FavoriteManager.js";
import { get } from "../../../_shared/edgeFunctionFetch.js";
import AuthManager from "../../../auth/AuthManager.js";
import { Room } from "../../../datamodel/Room.js";
import general_rooms from "../../../general_rooms.js";
import AddFavoritePopup from "../../../popup/user/AddFavoritePopup.js";
import SignInPopup from "../../../popup/user/SignInPopup.js";
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
              room.nft === (this._currentRoom as any).nft
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

  private displayLoadingRooms(): void {
    this.categories = [];
    FavoriteManager.clear();

    this.empty();
    const container = el("ul.container").appendTo(this);
    const categoryNode = new RoomCategory(
      "general",
      Object.values(general_rooms).map((room) => {
        return { type: "general", ...room };
      }),
    ).appendTo(
      container,
    );
    categoryNode.on("select", () => this.fireEvent("select"));
    this.categories.push(categoryNode);

    for (const category of ["Favorites", "Hot", "Owned"]) {
      new RoomCategory(category, [], true).appendTo(
        container,
      );
    }

    if (this._currentRoom) {
      this.currentRoom = this._currentRoom;
    }
  }

  private async loadRooms(): Promise<void> {
    this.displayLoadingRooms();

    const roomsResponse = await get(
      AuthManager.signed === undefined
        ? "get-rooms"
        : `get-rooms?token=${AuthManager.signed.token}`,
    );
    const roomsData: { [category: string]: Room[] } = await roomsResponse
      .json();

    this.categories = [];
    FavoriteManager.clear();

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
        click: () => {
          if (!AuthManager.signed) {
            new SignInPopup();
          } else {
            new AddFavoritePopup();
          }
        },
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
            room.nft === (roomItem.room as any).nft
          ))
        ) {
          roomItem.active();
          this.currentRoomItems.push(roomItem);
        }
      }
    }
  }
}
