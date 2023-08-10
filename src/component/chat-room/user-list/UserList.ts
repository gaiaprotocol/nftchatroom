import { DomNode, el, RetroLoader } from "common-dapp-module";
import SupabaseManager from "../../../SupabaseManager.js";
import { RealtimeChannel } from "@supabase/supabase-js";

export default class UserList extends DomNode {
  private _roomId: string | undefined;
  private _channel: RealtimeChannel | undefined;
  private loading: boolean = false;

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

  private createChannel() {
    if (this._channel !== undefined) {
      SupabaseManager.supabase.removeChannel(this._channel);
    }
    if (this._roomId !== undefined) {
      this.loading = true;
      this.empty().append(new RetroLoader());

      const channel = SupabaseManager.supabase.channel(this._roomId);
      channel.on(
        "presence",
        { event: "sync" },
        () => {
          const newState = channel.presenceState();
          console.log("sync", newState);
        },
      );
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user: "user-1",
            online_at: new Date().toISOString(),
          });

          this.empty();
          console.log("subscribed");
          this.loading = false;
        }
      });
      this._channel = channel;
    }
  }
}
