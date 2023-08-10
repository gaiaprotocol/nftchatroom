import { msg, Router } from "common-dapp-module";
import AuthManager from "./AuthManager.js";
import SupabaseManager from "./SupabaseManager.js";
import AuthTest from "./view/AuthTest.js";
import ChatRoomView from "./view/ChatRoomView.js";
import DesignTest from "./view/DesignTest.js";
import Layout from "./view/Layout.js";
import WalletManager from "./WalletManager.js";

export default async function install() {
  if (sessionStorage.__spa_path) {
    Router.goNoHistory(sessionStorage.__spa_path);
    sessionStorage.removeItem("__spa_path");
  }

  WalletManager.init();
  AuthManager.init();
  SupabaseManager.connect();

  await msg.loadYAMLs({
    en: ["/locales/en.yml"],
  });

  Router.route("**", Layout);
  Router.route("auth-test", AuthTest);
  Router.route("design-test", DesignTest);
  Router.route([
    "", // general room
    "{chain}/{address}", // nft room
    "{uri}", // general room
  ], ChatRoomView);
}
