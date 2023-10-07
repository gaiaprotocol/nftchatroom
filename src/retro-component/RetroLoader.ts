import el from "../dom/el.js";
import RetroComponent from "./RetroComponent.js";

export default class RetroLoader extends RetroComponent {
  constructor() {
    const index = Math.floor(Math.random() * 2) + 1;
    super(
      ".loader.index-" + index,
      el("img", {
        src: `/images/loader/loader-${index}.gif`,
      }),
    );
  }
}
