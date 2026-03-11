// app/routes/kontakt.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { sendMail } from "~/lib/email.server";
import { useMemo } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Kontakt – Schulbox" }];

type ActionResponse = {
  success: boolean;
  error?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  const captcha = formData.get("captcha");
  const captchaAnswer = formData.get("captcha_answer");

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return json<ActionResponse>({ success: false, error: "Ungültige Eingabe." });
  }

  if (!captcha || !captchaAnswer || captcha.toString().trim() !== captchaAnswer.toString().trim()) {
    return json<ActionResponse>({ success: false, error: "Die Sicherheitsfrage wurde falsch beantwortet." });
  }

  try {
    await sendMail({
      to: "office@schulbox.at",
      subject: `Neue Nachricht von ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Nachricht:</strong><br>${message.replace(/\n/g, "<br>")}</p>
      `,
    });
    return json<ActionResponse>({ success: true });
  } catch (error) {
    console.error("[Kontakt] Fehler beim Senden der Mail:", error);
    return json<ActionResponse>({ success: false, error: "Fehler beim Senden der Nachricht." });
  }
};

export default function Kontakt() {
  const result = useActionData<typeof action>();

  const captchaChallenge = useMemo(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { question: `Was ist ${a} + ${b}?`, answer: String(a + b) };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        className="bg-gray-900 origin-top"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >Kontakt</motion.h1>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >Wir freuen uns auf deine Nachricht.</motion.p>
        </div>
      </motion.div>

      <div className="max-w-xl mx-auto px-4 py-10 md:py-14">
        {result?.success ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Nachricht gesendet!</h2>
            <p className="text-gray-500 text-sm">Vielen Dank für deine Nachricht. Wir melden uns in Kürze.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Schreib uns</h2>
                <p className="text-xs text-gray-400">Alle Felder sind Pflichtfelder</p>
              </div>
            </div>

            {result?.error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{result.error}</p>
              </div>
            )}

            <Form method="post" className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Dein Name"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input
                  required
                  type="email"
                  name="email"
                  id="email"
                  placeholder="name@beispiel.at"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
                <textarea
                  required
                  name="message"
                  id="message"
                  rows={5}
                  placeholder="Deine Nachricht..."
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Simple math captcha */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-2">
                  Sicherheitsfrage: {captchaChallenge.question}
                </label>
                <input
                  required
                  type="text"
                  name="captcha"
                  id="captcha"
                  inputMode="numeric"
                  placeholder="Deine Antwort"
                  className="w-full border border-gray-200 bg-white rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                />
                <input type="hidden" name="captcha_answer" value={captchaChallenge.answer} />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Nachricht senden
              </button>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}

