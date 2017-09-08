import express from "express";
import serverMiddleware from "./core/server/middleware";

const app = express.Router();

/**
 * Create
 */
app.use((req, res, next) => {
  //eslint-disable-next-line
  console.log(res.locals);
  next();
});

/**
 * Your custom code here
 */

// Add the core server as middleware
app.use(serverMiddleware);

export default app;