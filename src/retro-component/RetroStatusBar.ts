import DomNode from "../dom/DomNode.js";
import el from "../dom/el.js";
import RetroComponent from "./RetroComponent.js";

export default class RetroStatusBar extends RetroComponent {
  constructor(options: {
    statuses: (string | DomNode | (string | DomNode)[])[];
  }) {
    super(
      ".status-bar",
      ...options.statuses.map((s) =>
        el(".status", ...(Array.isArray(s) ? s : [s]))
      ),
    );
  }
}
