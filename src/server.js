import express from "express";
import serverMiddleware from "./core/server/middleware";

const app = express.Router();
/**
 * --- Your custom code START ---
 */


/**
 * --- Your custom code END ---
 */
// Add the core server as middleware
app.use(serverMiddleware);

export default app;