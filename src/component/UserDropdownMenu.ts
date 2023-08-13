import { RetroDropdownMenu } from "common-dapp-module";

export default class UserDropdownMenu extends RetroDropdownMenu {
  constructor(x: number, y: number, walletAddress: string) {
    super({
      x,
      y,
      menus: [
        {
          label: "Profile",
          click: () => {
            console.log("Profile");
            this.delete();
          },
        },
      ],
    });
  }
}
