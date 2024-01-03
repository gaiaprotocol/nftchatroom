import { RetroDropdownMenu } from "common-app-module";
import UserInfoPopup from "../popup/user/UserInfoPopup.js";

export default class UserDropdownMenu extends RetroDropdownMenu {
  constructor(x: number, y: number, walletAddress: string, room: string) {
    super({
      x,
      y,
      menus: [
        {
          label: "Profile",
          click: () => {
            new UserInfoPopup(walletAddress, room);
            this.delete();
          },
        },
      ],
    });
  }
}
