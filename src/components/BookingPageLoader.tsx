"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";

const PHASES = [
  { title: "Hold tight", subtitle: "We're getting things ready for you" },
  { title: "Loading your options", subtitle: "Preparing your booking journey" },
];

const PHASE_DURATION_MS = 1800;

export function BookingPageLoader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const toPhase2 = setTimeout(() => setPhase(1), PHASE_DURATION_MS);
    const toExit = setTimeout(() => setShow(false), PHASE_DURATION_MS * 2);
    return () => {
      clearTimeout(toPhase2);
      clearTimeout(toExit);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          key="booking-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/97 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center text-center px-6">
            <div className="relative w-28 h-28 mb-10">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/10"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, #6a68de 25%, #82dbdf 50%, transparent 75%)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-1.5 rounded-full bg-dark flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 rounded-full bg-brand-gradient-animated flex items-center justify-center shadow-lg shadow-brand/30">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="h-24 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {PHASES[phase].title}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-400">
                    {PHASES[phase].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 mt-4">
              {PHASES.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 rounded-full"
                  animate={{
                    width: i === phase ? 32 : 8,
                    backgroundColor: i === phase ? "#82dbdf" : "rgba(255,255,255,0.2)",
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
