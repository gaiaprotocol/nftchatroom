import { RealtimeChannel } from "@supabase/supabase-js";
import { DomNode, el, RetroLoader } from "common-app-module";
import AuthManager from "../../../auth/AuthManager.js";
import SupabaseManager from "../../../SupabaseManager.js";
import UserItem from "./UserItem.js";

export default class UserList extends DomNode {
  private _roomId: string | undefined;
  private _channel: RealtimeChannel | undefined;

  constructor() {
    super(".user-list");
    this.onDelegate(SupabaseManager, "connect", () => this.createChannel());
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }

  public set roomId(roomId: string | undefined) {
    this._roomId = roomId;
    this.createChannel();
  }

  public createChannel(pfp?: { image_url?: string }) {
    if (this._channel !== undefined) {
      SupabaseManager.supabase.removeChannel(this._channel);
    }
    if (this._roomId !== undefined) {
      this.empty().append(new RetroLoader());

      const channel = SupabaseManager.supabase.channel(this._roomId);
      channel.on(
        "presence",
        { event: "sync" },
        () => {
          const newState: any = channel.presenceState();
          this.showUserList(newState);
        },
      );
      channel.subscribe(async (status, error) => {
        console.log(status, error);
        if (
          status === "SUBSCRIBED" && AuthManager.signed && (
            this._roomId?.includes(":") !== true || pfp !== undefined
          )
        ) {
          await channel.track({
            ens: AuthManager.signed.user?.ens,
            walletAddress: AuthManager.signed.walletAddress,
            pfp: pfp ? pfp : AuthManager.signed.user?.pfp,
            onlineAt: new Date().toISOString(),
          });
        }
      });
      this._channel = channel;
    }
  }

  private showUserList(users: {
    [key: string]: {
      walletAddress?: string;
      onlineAt: string;
    }[];
  }) {
    this.empty();
    const container = el("ul.container").appendTo(this);
    const addedWalletAddresses = new Set<string>();
    for (const user of Object.values(users)) {
      if (
        user[0].walletAddress &&
        !addedWalletAddresses.has(user[0].walletAddress)
      ) {
        container.append(new UserItem(user[0] as any, this._roomId!));
        addedWalletAddresses.add(user[0].walletAddress);
      }
    }
    if (addedWalletAddresses.size === 0) {
      container.append(
        el("li.empty", "There are no users connected to this room."),
      );
    }
  }
}
