import { Link } from "@remix-run/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Package, Pen, Heart, ArrowRight, CheckCircle, Users, Truck, Shield,
  Box, Scissors, BookOpen, Star, ChevronRight, Home, School,
  MessageCircle, ChevronDown, HelpCircle,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function Index() {
  return (
    <div className="overflow-hidden">
      {/* ═══════ HERO ═══════ */}
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-accent-50 py-20 md:py-32 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-100 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-6"
          >
            <Package className="w-4 h-4" />
            Der einfachste Schulstart Österreichs
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight"
          >
            Alles für den Schulstart
            <span className="block text-brand-600">in einer Box</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4"
          >
            Die Lehrkraft stellt die Schulmaterialien zusammen.
            Du bestellst alles mit einem Klick – fertig beschriftet und verpackt.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base text-gray-400 max-w-lg mx-auto mb-10"
          >
            Verpackt mit Herz in einer geschützten Werkstätte in Österreich.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/webshop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-300 hover:-translate-y-0.5"
            >
              Schulbox finden
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/ueber-uns"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-lg font-semibold transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              So funktioniert's
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "100%", label: "Aus Österreich" },
              { value: "1 Klick", label: "Bestellen" },
              { value: "Sozial", label: "Geschützte Werkstätten" },
              { value: "Fertig", label: "Beschriftet & Verpackt" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-brand-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SO FUNKTIONIERT'S ═══════ */}
      <Section className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeIn} custom={0} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              So funktioniert Schulbox
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              In 3 einfachen Schritten zum stressfreien Schulstart.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "1",
                icon: Users,
                title: "Lehrkraft stellt zusammen",
                desc: "Die Lehrkraft wählt alle benötigten Schulmaterialien für die Klasse aus und erstellt eine Schulbox.",
              },
              {
                step: "2",
                icon: Package,
                title: "Eltern bestellen",
                desc: "Eltern finden die Schulbox im Shop und bestellen mit einem Klick. Materialien können individuell angepasst werden.",
              },
              {
                step: "3",
                icon: Truck,
                title: "Fertig geliefert",
                desc: "Die Box wird in einer geschützten Werkstätte beschriftet, verpackt und direkt an die Schule oder nach Hause geliefert.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                custom={i + 1}
                variants={fadeIn}
                className="relative text-center"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                )}
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-brand-50 rounded-2xl mb-6">
                  <step.icon className="w-9 h-9 text-brand-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-brand-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ FÜR ELTERN ═══════ */}
      <Section className="py-20 md:py-28 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeIn} custom={0} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Für Eltern
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Alles was du für den Schulstart brauchst – ohne Stress.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Box,
                title: "Schulbox anpassen",
                desc: "Artikel tauschen, Mengen ändern oder günstigere Alternativen wählen – du hast die volle Kontrolle.",
                color: "brand",
              },
              {
                icon: Pen,
                title: "Persönlich beschriftet",
                desc: "Alle Hefte und Materialien werden auf Wunsch mit dem Namen deines Kindes versehen – fix und fertig.",
                color: "accent",
              },
              {
                icon: Home,
                title: "Lieferung nach Wahl",
                desc: "Direkt an die Schule zum Schulbeginn oder bequem nach Hause – du entscheidest.",
                color: "emerald",
              },
              {
                icon: Heart,
                title: "Sozial verpackt",
                desc: "Beschriftung und Verpackung erfolgen in einer geschützten Werkstätte in Österreich.",
                color: "rose",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 1}
                variants={fadeIn}
                className="group bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ FÜR LEHRKRÄFTE ═══════ */}
      <Section className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn} custom={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium mb-4">
                <School className="w-3.5 h-3.5" />
                Für Lehrkräfte
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Schulboxen erstellen leicht gemacht
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Als Lehrkraft kannst du in unserem Konfigurator die benötigten Schulmaterialien auswählen
                und eine Schulbox für deine Klasse zusammenstellen. Deine Eltern müssen dann nur noch bestellen.
              </p>
              <div className="space-y-3">
                {[
                  "Produkte aus dem Shop direkt in die Box legen",
                  "Alternative Produkte für verschiedene Bedürfnisse festlegen",
                  "Schulbox mit einem Klick veröffentlichen",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all hover:shadow-md"
              >
                Jetzt registrieren
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} custom={1} className="grid grid-cols-2 gap-4">
              {[
                { icon: BookOpen, title: "Hefte & Blöcke", desc: "A4, A5, kariert, liniert" },
                { icon: Pen, title: "Stifte & Farben", desc: "Bleistifte, Buntstifte, Marker" },
                { icon: Scissors, title: "Bastelbedarf", desc: "Scheren, Kleber, Lineale" },
                { icon: Package, title: "Schulbox", desc: "Alles in einer Box" },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-gray-50 rounded-2xl p-5 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all duration-300"
                >
                  <card.icon className="w-7 h-7 text-brand-500 mb-3" />
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{card.title}</h4>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════ GESCHÜTZTE WERKSTÄTTE ═══════ */}
      <Section className="py-20 md:py-28 px-4 bg-gradient-to-br from-rose-50 via-white to-brand-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn} custom={1} className="order-2 md:order-1">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
                    <Heart className="w-7 h-7 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Soziale Verantwortung</h3>
                    <p className="text-sm text-gray-500">Bei jeder Schulbox</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Beschriftung", desc: "Jeder Artikel wird sorgfältig mit dem Namen des Kindes beschriftet" },
                    { label: "Verpackung", desc: "Alle Materialien werden ordentlich in die Schulbox verpackt" },
                    { label: "Lieferung", desc: "Die fertige Box wird an die Schule oder nach Hause geliefert" },
                  ].map((item, i) => (
                    <div key={item.label} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-rose-600 text-sm font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                        <p className="text-gray-500 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} custom={0} className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Verpackt mit Herz
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Jede Schulbox wird in einer geschützten Werkstätte in Österreich liebevoll verpackt.
                So unterstützt du mit deinem Einkauf Menschen, die eine sinnvolle Arbeit verdienen.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                Der kleine Zuschlag für die Werkstätte deckt die Beschriftung aller Materialien mit dem
                Namen deines Kindes, die sorgfältige Verpackung und die Lieferung an die Schule.
                Du kannst auch ohne Werkstatt-Service bestellen – dann liefern wir direkt zu dir nach Hause.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600">
                  <Shield className="w-3.5 h-3.5 text-brand-500" /> Qualitätsprodukte
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Sozial verpackt
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Aus Österreich
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════ LIEFEROPTIONEN ═══════ */}
      <Section className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeIn} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Deine Wahl, deine Lieferung
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Bei jeder Schulbox entscheidest du selbst, wie und wohin geliefert wird.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              variants={fadeIn}
              custom={1}
              className="bg-brand-50 rounded-2xl p-8 border border-brand-100"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                <School className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">An die Schule</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Die Schulbox wird rechtzeitig zum Schulbeginn direkt an die Schule geliefert.
                Beschriftet und fertig verpackt von der geschützten Werkstätte.
              </p>
              <div className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                <CheckCircle className="w-4 h-4" /> Inklusive Beschriftung & Verpackung
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              custom={2}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nach Hause</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Du möchtest die Materialien selbst bekleben? Kein Problem – wir liefern die
                Schulbox direkt zu dir nach Hause. Versandkosten fallen an.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Truck className="w-4 h-4" /> Versand per Post
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <Section className="py-20 md:py-28 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeIn} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Das sagen Eltern & Lehrkräfte
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Schulbox macht den Schulstart einfacher – für alle Beteiligten.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Endlich kein stundenlanges Suchen mehr! Die Schulbox war perfekt gepackt und beschriftet – mein Sohn war begeistert.",
                name: "Maria K.",
                role: "Mutter, VS Graz",
                stars: 5,
              },
              {
                quote: "Als Lehrerin spare ich mir unzählige Nachrichten an die Eltern. Ich stelle die Box zusammen und alle haben das Richtige.",
                name: "Sabine L.",
                role: "Lehrerin, VS Wien",
                stars: 5,
              },
              {
                quote: "Tolle Idee mit der geschützten Werkstätte! Man merkt, dass hier soziale Verantwortung mitgedacht wird.",
                name: "Thomas R.",
                role: "Vater, VS Linz",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                custom={i + 1}
                variants={fadeIn}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ FAQ ═══════ */}
      <Section className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeIn} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Häufige Fragen
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Alles, was du über Schulbox wissen musst.
            </p>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: "Wer kann eine Schulbox erstellen?",
                a: "Lehrkräfte können sich registrieren und nach Freischaltung den Box-Konfigurator nutzen. Dort stellen sie die benötigten Materialien für ihre Klasse zusammen.",
              },
              {
                q: "Kann ich einzelne Artikel in der Schulbox austauschen?",
                a: "Ja! Die Lehrkraft kann alternative Produkte hinterlegen. Beim Kauf können Eltern zwischen den Optionen wählen und die Box individuell anpassen.",
              },
              {
                q: "Was kostet die Beschriftung und Verpackung?",
                a: "Der Werkstatt-Zuschlag wird transparent auf den Artikelpreis aufgeschlagen. Er deckt die individuelle Beschriftung aller Materialien, die Verpackung und die Lieferung an die Schule.",
              },
              {
                q: "Kann ich auch ohne Werkstatt-Service bestellen?",
                a: "Ja, du kannst die Materialien auch unbeschriftet direkt nach Hause bestellen. Dann fallen nur die regulären Versandkosten an.",
              },
              {
                q: "Woher kommen die Produkte?",
                a: "Wir bieten hochwertige Schulmaterialien bekannter Marken aus Österreich und Europa an. Qualität steht bei uns an erster Stelle.",
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                custom={i + 1}
                variants={fadeIn}
                className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors list-none">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-4 pt-1 text-sm text-gray-500 leading-relaxed pl-12">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20 md:py-28 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bereit für einen stressfreien Schulstart?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Entdecke die Schulboxen deiner Schule oder stöbere in unserem Shop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/webshop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Zum Shop
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/kontakt"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-lg font-semibold transition-all duration-300 border border-gray-700 hover:-translate-y-0.5"
              >
                Kontakt
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
