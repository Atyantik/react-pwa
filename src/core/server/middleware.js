import _ from "lodash";
import {
  enableServiceWorker,
} from "../../../settings";
import config from "../../config";
import { infiniteCache } from "../libs/cache/memory";

const __development = process.env.NODE_ENV === "development";

let app = null;
// When not developing code, enabling it during development
// will take up un-necessary time and resources

if (__development) {
  // Hacky solution for webpack to not include the file
  // babel can import it as it will eval it and the file will be
  // still there.
  app =  eval("require")("./dev.server").default;
} else {
  app = require("./prod.server").default;
}


if (enableServiceWorker) {

  // Only if service worker is enabled then emit manifest.json
  app.get("/manifest.json", infiniteCache(), (req, res) => {
  
    const { pwa } = config;
  
    const availableSizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const icons = availableSizes.map(size => {
      return {
        "src": require(`../../resources/images/pwa/icon-${size}x${size}.png`),
        sizes: `${size}x${size}`
      };
    });
    _.set(pwa, "icons", icons);
  
    res.setHeader("Content-Type", "application/manifest+json");
    // No cache header
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.setHeader("Expires", "-1");
    res.setHeader("Pragma", "no-cache");
  
    return res.send(JSON.stringify(pwa));
  });
}

export default app;
