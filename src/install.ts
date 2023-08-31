import { msg, Router, Store } from "common-dapp-module";
import AuthManager from "./auth/AuthManager.js";
import WalletManager from "./auth/WalletManager.js";
import BootingPopup from "./popup/common/BootingPopup.js";
import SupabaseManager from "./SupabaseManager.js";
import Layout from "./view/Layout.js";
import RoomView from "./view/RoomView.js";

export default async function install() {
  const settingStore = new Store("setting");
  document.documentElement.style.setProperty(
    "zoom",
    settingStore.get("zoom") ?? "1",
  );

  if (sessionStorage.__spa_path) {
    Router.goNoHistory(sessionStorage.__spa_path);
    sessionStorage.removeItem("__spa_path");
  }

  const booting = new BootingPopup();
  WalletManager.init();
  await AuthManager.init();
  SupabaseManager.connect();

  await msg.loadYAMLs({
    en: ["/locales/en.yml"],
  });
  booting.delete();

  Router.route("**", Layout);
  Router.route([
    "", // general room
    "{chain}/{address}", // nft room
    "{uri}", // general room
  ], RoomView);
}
