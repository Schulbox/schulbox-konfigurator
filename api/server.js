import express from 'express';
import compression from 'compression';
import { createRequestHandler } from '@remix-run/express';
import * as build from '../build/server/index.js';
import cors from 'cors';
import { supabase } from '../supabaseClient'; // Versuche es mit der Dateiendung


const app = express();

// Verwende express.json(), um den Body als JSON zu verarbeiten
app.use(express.json());

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

// Login-Route, um die Login-Daten zu verarbeiten
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.error("Missing email or password"); // Fehlermeldung, wenn ein Parameter fehlt
    return res.status(400).json({ error: 'Email und Passwort sind erforderlich.' });
  }

  try {
    console.log('Login Request:', { email, password });

    // Authentifizierung mit Supabase
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Auth Error:', error.message); // Detaillierte Fehlernachricht
      return res.status(400).json({ error: error.message });
    }

    // Erfolgreiche Anmeldung
    console.log('Login Success:', { user });
    return res.status(200).json({ message: 'Login erfolgreich', user });
  } catch (err) {
    console.error('Unexpected Error:', err); // Unerwartete Fehler werden hier ausgegeben
    return res.status(500).json({ error: 'Es gab ein Problem bei der Anmeldung.' });
  }
});

// Remix handler für alle anderen Routen
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

export default app;
