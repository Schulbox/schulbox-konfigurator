// app/routes/widerruf.tsx
import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => [{ title: "Widerruf – Schulbox" }];

export default function Widerruf() {
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
          >Widerruf</motion.h1>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >Widerrufsbelehrung</motion.p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="space-y-6 text-sm leading-relaxed text-gray-600">
            <p>
              Verbraucher:innen haben grundsätzlich ein <strong className="text-gray-900">14-tägiges Widerrufsrecht</strong>.
            </p>

            <div>
              <p className="font-semibold text-gray-900 mb-2">Vom Widerruf ausgeschlossen sind:</p>
              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                <span>Waren, die nach Kundenspezifikation angefertigt wurden (z. B. personalisierte Schulartikel).</span>
              </div>
            </div>

            <p>
              Zur Ausübung des Widerrufsrechts senden Sie bitte eine formlose Nachricht an:
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p>
                <strong className="text-gray-900">E-Mail:</strong>{" "}
                <a href="mailto:office@schulbox.at" className="text-brand-600 hover:text-brand-700 transition-colors">office@schulbox.at</a>
              </p>
              <p>
                <strong className="text-gray-900">Telefon:</strong>{" "}
                <a href="tel:+436763172307" className="text-brand-600 hover:text-brand-700 transition-colors">+43 676 3172307</a>
              </p>
            </div>

            <p>
              Rücksendungen erfolgen <strong className="text-gray-900">ausschließlich nach Rücksprache</strong> und werden direkt mit dem Lieferanten abgewickelt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
