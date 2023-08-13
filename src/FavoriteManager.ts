import { EventContainer } from "common-dapp-module";
import { getRoomId, Room } from "./datamodel/Room.js";

class FavoriteManager extends EventContainer {
  private favorites: Room[] = [];

  public add(room: Room): void {
    this.favorites.push(room);
    this.fireEvent("add", room);
  }

  public remove(roomId: string): void {
    this.favorites = this.favorites.filter((r) => getRoomId(r) !== roomId);
    this.fireEvent("remove", roomId);
  }

  public clear(): void {
    for (const room of this.favorites) {
      this.fireEvent("remove", room);
    }
    this.favorites = [];
  }

  public check(roomId: string): boolean {
    return this.favorites.some((r) => getRoomId(r) === roomId);
  }
}

export default new FavoriteManager();
