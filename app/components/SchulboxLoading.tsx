import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";

const schoolItems = [
  { name: "Hefte", emoji: "📓", delay: 0 },
  { name: "Stifte", emoji: "✏️", delay: 0.4 },
  { name: "Schere", emoji: "✂️", delay: 0.8 },
  { name: "Lineal", emoji: "📏", delay: 1.2 },
  { name: "Farben", emoji: "🎨", delay: 1.6 },
  { name: "Kleber", emoji: "📎", delay: 2.0 },
  { name: "Radierer", emoji: "🧽", delay: 2.4 },
  { name: "Spitzer", emoji: "🖊️", delay: 2.8 },
];

export default function SchulboxLoading({ targetUrl }: { targetUrl: string }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const lottieRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Progress-Simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 60);

    // Item-Animation
    const itemInterval = setInterval(() => {
      setCurrentItem((prev) => (prev + 1) % schoolItems.length);
    }, 500);

    // Navigate nach Animation
    const timeout = setTimeout(() => {
      navigate(targetUrl);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(itemInterval);
      clearTimeout(timeout);
    };
  }, [navigate, targetUrl]);

  // Lottie laden wenn verfügbar
  useEffect(() => {
    if (typeof window === "undefined" || !lottieRef.current) return;

    import("lottie-web").then((lottie) => {
      const anim = (lottie as any).default?.loadAnimation?.({
        container: lottieRef.current!,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/images/schulbox_loading_animation/loading_animation.json",
        assetsPath: "/images/schulbox_loading_animation/images/",
      });

      return () => anim?.destroy?.();
    }).catch(() => {
      // Lottie nicht verfügbar, CSS-Animation als Fallback
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Box-Animation */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Lottie Container */}
          <div ref={lottieRef} className="w-full h-full" />

          {/* Fallback: CSS Animierte Items die in die Box fliegen */}
          {schoolItems.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -60, x: (i % 2 === 0 ? -1 : 1) * 40 }}
              animate={{
                opacity: currentItem >= i ? [0, 1, 1, 0] : 0,
                y: currentItem >= i ? [-60, -20, 20, 60] : -60,
                x: currentItem >= i ? [(i % 2 === 0 ? -1 : 1) * 40, 0, 0, 0] : 0,
                scale: currentItem >= i ? [1, 1.2, 1, 0.5] : 1,
              }}
              transition={{
                duration: 1.2,
                delay: item.delay,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none"
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>

        {/* Fortschrittsbalken */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Text */}
        <motion.p
          className="text-gray-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Schulbox wird erstellt...
        </motion.p>
        <p className="text-gray-400 text-sm mt-2">
          Deine Schulbox wird als Produkt angelegt
        </p>
      </div>
    </div>
  );
}
