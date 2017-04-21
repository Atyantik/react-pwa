import express from "express";
import _ from "lodash";

const app = express();

// Set x-powered-by to false
_.set(app, "locals.settings.x-powered-by", false);

export default app;