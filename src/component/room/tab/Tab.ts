import { DomNode } from "common-dapp-module";

export default class Tab extends DomNode {
  constructor(label: string, active: boolean) {
    super("li.tab");
    this.append(label);
    if (active) {
      this.addClass("active");
    }
  }
}
