import { RealtimeChannel } from "@supabase/supabase-js";
import { DomNode, RetroLoader } from "common-dapp-module";
import SupabaseManager from "../../../SupabaseManager.js";

export default class MessageList extends DomNode {
  private _roomId: string | undefined;
  private _channel: RealtimeChannel | undefined;
  private loading: boolean = false;

  constructor() {
    super(".message-list");
    this.onDelegate(SupabaseManager, "connect", () => this.createChannel());
  }

  public set roomId(roomId: string | undefined) {
    this._roomId = roomId;
    this.loadMessages();
    this.createChannel();
  }

  private async loadMessages() {
    this.loading = true;
    this.empty().append(new RetroLoader());
    const { data, error } = await SupabaseManager.supabase.from("messages")
      .select()
      .eq("room", this._roomId)
      .order("created_at", { ascending: false });
    this.empty();
    console.log(data);
    this.loading = false;
  }

  private createChannel() {
    if (this._channel !== undefined) {
      SupabaseManager.supabase.removeChannel(this._channel);
    }
    if (this._roomId !== undefined) {
      this._channel = SupabaseManager.supabase
        .channel("message-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: "room=eq." + this._roomId,
          },
          (payload) => console.log(payload),
        )
        .subscribe();
    }
  }
}
