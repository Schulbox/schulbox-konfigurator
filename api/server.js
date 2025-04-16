import express from "express";
import compression from "compression";
import { createRequestHandler } from "@remix-run/express";
import * as build from "../build/server/index.js";





const app = express();
app.use(compression());

// WICHTIG: Header explizit setzen
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors https://schulbox.at;");
  res.removeHeader("X-Frame-Options"); // sicherstellen, dass X-Frame-Options nicht DENY ist
  next();
});

// Remix handler
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

export default app;
