// app/routes/datenschutz.tsx
import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => [{ title: "Datenschutz – Schulbox" }];

export default function Datenschutz() {
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
          >Datenschutz</motion.h1>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >Erklärung zur Informationspflicht gemäß DSGVO</motion.p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="space-y-6 text-sm leading-relaxed text-gray-600">
            <p>
              In folgender Datenschutzerklärung informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Webseite. Wir erheben und verarbeiten personenbezogene Daten nur auf Grundlage der gesetzlichen Bestimmungen (Datenschutzgrundverordnung, Telekommunikationsgesetz 2003).
            </p>
            <p>
              Sobald Sie unsere Webseite besuchen, wird Ihre IP-Adresse sowie Beginn und Ende der Sitzung erfasst. Dies ist technisch bedingt und stellt ein berechtigtes Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO dar.
            </p>

            <hr className="border-gray-100" />

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Kontakt mit uns</h2>
              <p>
                Wenn Sie uns über das Kontaktformular oder per E-Mail kontaktieren, werden Ihre Angaben zur Bearbeitung der Anfrage für sechs Monate gespeichert. Ohne Ihre Einwilligung erfolgt keine Weitergabe.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Datenspeicherung</h2>
              <p>
                Zur Vertragsabwicklung und Benutzerfreundlichkeit speichern wir Daten wie IP-Adresse, Vorname, Nachname, Adresse, E-Mail, Telefonnummer, Name des Kindes. Die Datenverarbeitung basiert auf Art. 6 Abs. 1 lit. a und b DSGVO sowie § 96 Abs. 3 TKG.
              </p>
              <p className="mt-2">
                Bei Abbruch eines Einkaufs werden Ihre Daten gelöscht. Bei Vertragsabschluss bleiben sie bis zum Ablauf gesetzlicher Fristen gespeichert (7 Jahre steuerlich, 10 Jahre produkthaftungsrechtlich).
              </p>
              <p className="mt-2">
                Eine Weitergabe erfolgt nur an Zahlungsdienstleister, Versandunternehmen und unseren Steuerberater.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Cookies</h2>
              <p>
                Unsere Website verwendet Cookies zur Verbesserung der Nutzerfreundlichkeit. Einige Cookies bleiben auf Ihrem Gerät gespeichert, bis Sie diese löschen. Sie können die Nutzung in Ihrem Browser konfigurieren.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Google Fonts</h2>
              <p>
                Wir nutzen Schriftarten von Google Fonts (Google Ireland Limited, Gordon House, Dublin). Dabei werden Daten wie IP-Adresse an Google übermittelt, ggf. auch Cookies gesetzt. Dies erfolgt im berechtigten Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <p className="mt-2">
                Weitere Informationen:{" "}
                <a href="https://developers.google.com/fonts/faq" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 transition-colors">developers.google.com/fonts/faq</a>
                {" "}und{" "}
                <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 transition-colors">policies.google.com/privacy</a>
              </p>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Ihre Rechte als Betroffener</h2>
              <p>
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Datenübertragbarkeit, Widerruf und Einschränkung der Verarbeitung. Beschwerden richten Sie bitte an uns oder an die Datenschutzbehörde.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Kontakt</h2>
              <p>Webseitenbetreiber: Ahmed Kamal el din</p>
              <p>Telefon: <a href="tel:+436763172307" className="text-brand-600 hover:text-brand-700 transition-colors">+43 676 3172307</a></p>
              <p>E-Mail: <a href="mailto:office@schulbox.at" className="text-brand-600 hover:text-brand-700 transition-colors">office@schulbox.at</a></p>
            </div>

            <p className="text-xs text-gray-400 pt-4">Quelle: Datenschutzgenerator Österreich DSGVO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
