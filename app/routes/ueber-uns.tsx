import { Lightbulb, Target, BookOpen, Heart } from "lucide-react";
import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => [{ title: "Über uns – Schulbox" }];

export default function UeberUns() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <motion.div
        className="bg-gray-900 origin-top"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >Über uns</motion.h1>
          <motion.p
            className="text-gray-400 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >Wir machen den Schulstart einfach, persönlich und sozial verantwortungsvoll.</motion.p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14 space-y-6">
        {/* Vision */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-brand-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Unsere Vision</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Bildung sollte leicht, freudig und für alle zugänglich sein. Mit Schulbox möchten wir den Schulstart für alle Familien einfacher und angenehmer machen. Wir setzen auf Leichtigkeit und geben den Eltern ihre wertvolle Zeit zurück – für die Dinge, die wirklich zählen: gemeinsame Erlebnisse, entspannte Ferien und einen stressfreien Schulanfang.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Unsere Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Unsere Mission bei Schulbox ist es, den Stress aus der Schulvorbereitung zu nehmen und Familien die Freiheit zu geben, ihre Zeit sinnvoll zu verbringen. Wir übernehmen die gesamte Planung und Organisation. Und das nicht nur effizient, sondern auch sozial verantwortungsbewusst.
          </p>
        </div>

        {/* Geschichte */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Unsere Geschichte</h2>
          </div>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p className="italic border-l-4 border-brand-200 pl-4 text-gray-500">
              „Ich wollte nie Millionär werden, ich wollte die Welt verändern und etwas Bleibendes hinterlassen."
            </p>
            <p>
              Als mein Stiefsohn in die Schule kam, fiel mir zum ersten Mal die enorme Vorbereitung auf, die der Schulstart mit sich brachte. Das Suchen und Kaufen von Materialien, das Beschriften der Hefte, das Verpacken der Schulutensilien und das mühsame Schleppen der Schulsachen an den ersten Schultagen – das alles kostete unglaublich viel Zeit, Geld und Nerven.
            </p>
            <p>
              Da kam mir die Idee: Schulbox. Ich wollte den Eltern all diese anstrengenden Aufgaben abnehmen und ihnen ermöglichen, die Zeit in den Ferien für sich und ihre Familie zu nutzen.
            </p>
            <p>
              Doch das war noch nicht alles. Ich hörte, dass viele geschützte Werkstätten dringend Aufträge suchen, um ihre Werkstätten am Leben zu erhalten. So kam die Idee, nicht nur den Schulstart zu erleichtern, sondern auch den sozialen Aspekt zu integrieren. Jede Schulbox wird in einer geschützten Werkstatt verpackt.
            </p>
          </div>
        </div>

        {/* Sozial */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Mehr als eine Dienstleistung</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Schulbox ist ein Projekt mit Herz, das Familien unterstützt und gleichzeitig den Menschen hilft, die in geschützten Werkstätten eine sinnvolle Arbeit finden.
          </p>
        </div>
      </div>
    </div>
  );
}
