// app/routes/agb.tsx
import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => [{ title: "AGB – Schulbox" }];

export default function AGB() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        className="bg-gray-900 origin-top"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >AGB</motion.h1>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >Allgemeine Geschäftsbedingungen</motion.p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="space-y-6 text-sm leading-relaxed text-gray-600">
            <p>
              Die folgenden Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über unseren Online-Shop durch Verbraucher mit Wohnsitz in Österreich. Mit der Bestellung akzeptieren Kund:innen die nachstehenden Bedingungen.
            </p>

            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Vertragspartner ist <strong className="text-gray-900">Schulbox</strong>, Einzelunternehmen mit Sitz in Vöcklamarkt.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Bestellungen sind ausschließlich für den privaten Gebrauch bestimmt.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Die Preise verstehen sich in Euro inkl. Steuern. Versandkosten werden separat ausgewiesen.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Die Bezahlung erfolgt über <strong className="text-gray-900">PayPal, Klarna, Kreditkarte oder Debitkarte</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Personalisierte Produkte sind vom <strong className="text-gray-900">Widerrufsrecht ausgeschlossen</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Für Rückgaben bitten wir um vorherige Kontaktaufnahme per <a href="mailto:office@schulbox.at" className="text-brand-600 hover:text-brand-700 transition-colors">E-Mail</a> oder telefonisch.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Es gilt das <strong className="text-gray-900">Recht der Republik Österreich</strong>.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
