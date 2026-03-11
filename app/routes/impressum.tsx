// app/routes/impressum.tsx
import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => [{ title: "Impressum – Schulbox" }];

export default function Impressum() {
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
          >Impressum</motion.h1>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >Informationen und Offenlegung gemäß §5 (1) ECG, § 25 MedienG, § 63 GewO und § 14 UGB</motion.p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="space-y-6 text-sm leading-relaxed text-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Webseitenbetreiber</h2>
                <p>Ahmed Kamal el din</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Anschrift</h2>
                <p>Exlwöhr 57, 4870 Vöcklamarkt</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">UID-Nr</h2>
                <p className="text-gray-400 italic">—</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Gewerbeaufsichtbehörde</h2>
                <p>Bezirkshauptmannschaft Vöcklabruck</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Kontaktdaten</h2>
              <p>Telefon: <a href="tel:+436763172307" className="text-brand-600 hover:text-brand-700 transition-colors">+43 676 3172307</a></p>
              <p>E-Mail: <a href="mailto:office@schulbox.at" className="text-brand-600 hover:text-brand-700 transition-colors">office@schulbox.at</a></p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Anwendbare Rechtsvorschrift</h2>
              <p><a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 transition-colors">www.ris.bka.gv.at</a></p>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Online Streitbeilegung</h2>
              <p>
                Verbraucher, welche in Österreich oder in einem sonstigen Vertragsstaat der ODR-VO niedergelassen sind, haben die Möglichkeit, Probleme bezüglich dem entgeltlichen Kauf von Waren oder Dienstleistungen im Rahmen einer Online-Streitbeilegung zu lösen.
              </p>
              <p className="mt-2">
                Plattform der EU-Kommission:{" "}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 transition-colors">
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Urheberrecht</h2>
              <p>
                Die Inhalte dieser Webseite unterliegen, soweit dies rechtlich möglich ist, diversen Schutzrechten (z.B. dem Urheberrecht). Jegliche Verwendung/Verbreitung von bereitgestelltem Material, welche urheberrechtlich untersagt ist, bedarf schriftlicher Zustimmung des Webseitenbetreibers.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Haftungsausschluss</h2>
              <p>
                Trotz sorgfältiger inhaltlicher Kontrolle übernimmt der Webseitenbetreiber keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
              </p>
              <p className="mt-2">
                Die Urheberrechte Dritter werden mit größter Sorgfalt beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen Hinweis. Bei Bekanntwerden werden die betroffenen Inhalte umgehend entfernt.
              </p>
            </div>

            <p className="text-xs text-gray-400 pt-4">Quelle: Impressum Generator Österreich</p>
          </div>
        </div>
      </div>
    </div>
  );
}
