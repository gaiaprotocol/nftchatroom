import BodyNode from "../dom/BodyNode.js";
import el from "../dom/el.js";
import RetroComponent from "./RetroComponent.js";

export default class RetroDropdownMenu extends RetroComponent {
  constructor(options: {
    x: number;
    y: number;
    menus: {
      label: string;
      click: () => void;
    }[];
  }) {
    super("ul.dropdown-menu");
    this.style({
      position: "fixed",
      left: `${options.x}px`,
      top: `${options.y}px`,
      "z-index": "9999999",
    });
    for (const menu of options.menus) {
      this.append(
        el("li", menu.label, {
          click: menu.click,
        }),
      );
    }
    BodyNode.append(this);

    const rect = this.rect;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = rect.width;
    const menuHeight = rect.height;
    const x = rect.x;
    const y = rect.y;
    if (x + menuWidth > windowWidth) {
      this.style({
        left: `${windowWidth - menuWidth}px`,
      });
    }
    if (y + menuHeight > windowHeight) {
      this.style({
        top: `${windowHeight - menuHeight}px`,
      });
    }

    this.onDom("click", (event) => event.stopPropagation());
    window.addEventListener("click", this.windowClickHandler);
  }

  private windowClickHandler = () => {
    this.delete();
  };

  public delete() {
    window.removeEventListener("click", this.windowClickHandler);
    super.delete();
  }
}
