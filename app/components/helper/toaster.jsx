"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

// Shows the latest toast() for a few seconds.
export default function Toaster() {
  const [note, setNote] = useState(null);

  useEffect(() => {
    let timer = 0;
    const show = (e) => {
      clearTimeout(timer);
      setNote({ id: Date.now(), text: e.detail });
      timer = setTimeout(() => setNote(null), 4200);
    };
    window.addEventListener("sw-toast", show);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("sw-toast", show);
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[max(20px,env(safe-area-inset-bottom))] z-[120] flex justify-center px-4">
      <AnimatePresence>
        {note && (
          <motion.p
            key={note.id}
            className="max-w-[520px] select-text border border-white/20 bg-[#0b0b0b] px-4 py-3 text-center text-[12.5px] leading-relaxed text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            {note.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
