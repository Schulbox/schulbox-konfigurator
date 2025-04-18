import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import * as build from '../build/server/index.js';
import { createClient } from '@supabase/supabase-js';
import compression from 'compression';
import cors from 'cors';

const app = express();

// Initialisiere Supabase-Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// Verwende express.json(), um den Body als JSON zu verarbeiten
app.use(express.json());

// CORS-Middleware hinzufügen, um Anfragen von der Domain zuzulassen
app.use(cors({
  origin: 'https://schulbox.at',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Kompressions-Middleware hinzufügen
app.use(compression());

// WICHTIG: Header explizit setzen
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors https://schulbox.at;");
  res.removeHeader("X-Frame-Options");
  next();
});

// Login-Route für die Login-Daten
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Überprüfen, ob sowohl E-Mail als auch Passwort angegeben sind
  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort sind erforderlich.' });
  }

  try {
    // Versuche, den Benutzer bei Supabase einzuloggen
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Wenn ein Fehler beim Login auftritt
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Login war erfolgreich
    return res.status(200).json({ message: 'Login erfolgreich', user: data.user });
  } catch (err) {
    // Fehlerbehandlung bei unerwarteten Problemen
    console.error('Fehler beim Login:', err);
    return res.status(500).json({ error: 'Es gab ein Problem bei der Anmeldung.' });
  }
});

// Remix handler für alle anderen Routen
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

// Server starten
export default app;
