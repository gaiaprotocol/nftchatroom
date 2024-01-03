import { DomNode } from "common-app-module";
import { Room } from "../../datamodel/Room.js";
import RoomInfoDisplay from "../RoomInfoDisplay.js";

export default class RoomInfoTab extends DomNode {
  private _room: Room | undefined;

  constructor() {
    super(".room-info-tab");
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  public set room(room: Room) {
    this._room = room;
    this.empty().append(new RoomInfoDisplay(room));
  }

  public get room(): Room | undefined {
    return this._room;
  }
}
