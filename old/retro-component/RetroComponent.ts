import DomNode from "../dom/DomNode.js";

export default class RetroComponent<EL extends HTMLElement = HTMLElement>
  extends DomNode<EL> {
  constructor(tag: string, ...nodes: (DomNode | string | undefined)[]) {
    super(tag + ".retro-component");
    this.append(...nodes);
  }
}
