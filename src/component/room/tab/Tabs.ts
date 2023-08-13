import { DomNode } from "common-dapp-module";
import Tab from "./Tab.js";

export default class Tabs extends DomNode {
  constructor(tabs: { label: string; active: boolean }[]) {
    super("ul.tabs");
    for (const tab of tabs) {
      this.append(new Tab(tab.label, tab.active));
    }
  }
}
