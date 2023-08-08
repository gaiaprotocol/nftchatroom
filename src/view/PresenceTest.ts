import { DomNode, el, View } from "common-dapp-module";
import Layout from "./Layout.js";
import { createClient } from "@supabase/supabase-js";
import Config from "../Config.js";

export default class PresenceTest extends View {
  private container: DomNode;

  constructor() {
    super();
    Layout.append(
      this.container = el(".home-view"),
    );
    this.test();
  }

  private test() {
    const clientA = createClient(Config.supabaseURL, Config.supabaseAnonKey);
    const channelA = clientA.channel("room-1");
    channelA
      .on(
        "presence",
        { event: "sync" },
        () => {
          const newState = channelA.presenceState();
          console.log("sync", newState);
        },
      )
      .on(
        "presence",
        { event: "join" },
        ({ key, newPresences }) => {
          console.log("join", key, newPresences);
        },
      )
      .on(
        "presence",
        { event: "leave" },
        ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const presenceTrackStatus = await channelA.track({
            user: "user-1",
            online_at: new Date().toISOString(),
          });
          console.log(presenceTrackStatus);
        }
      });
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
