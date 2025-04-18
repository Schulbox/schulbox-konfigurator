import express from "express";
import compression from "compression";
import { createRequestHandler } from "@remix-run/express";
import * as build from "../build/server/index.js";
import cors from 'cors';

const app = express();

// CORS-Middleware hinzufügen, um Anfragen von der Domain zuzulassen
app.use(cors({
  origin: 'https://schulbox.at',  // Erlaubte Domain
  methods: ['GET', 'POST'],      // Erlaubte Methoden
  allowedHeaders: ['Content-Type', 'Authorization'],  // Erlaubte Header
}));

// Kompressions-Middleware hinzufügen
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
