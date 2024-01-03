import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import Config from "./Config.js";

dayjs.extend(relativeTime);

export default async function initialize(config: Config) {
}
