import { initMeetAiraDemo } from "./meetaira.js";
import { initTrendsDemo } from "./trends.js";
import { initCopilotDemo } from "./copilot.js";
import { initLiveOrdersDemo } from "./liveorders.js";
import { initComponentPlayground } from "./components.js";

/** Every Selected Work demo. Each one no-ops if its markup isn't present. */
export function initProductDemos() {
  initMeetAiraDemo();
  initTrendsDemo();
  initCopilotDemo();
  initLiveOrdersDemo();
  initComponentPlayground();
}
