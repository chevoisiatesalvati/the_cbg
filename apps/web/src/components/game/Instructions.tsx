"use client";

import { motion } from "framer-motion";

interface InstructionsProps {
  entryFeeFormatted: string;
}

export function Instructions({ entryFeeFormatted }: InstructionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-16 bg-white border-4 border-black p-12"
    >
      <h2 className="font-alpina text-5xl font-light italic text-celo-purple mb-8 tracking-tighter">
        HOW TO <span className="not-italic">PLAY</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { num: "01", text: "Connect your wallet" },
          { num: "02", text: `Get 1 free play every 24 hours, or pay ${parseFloat(entryFeeFormatted).toFixed(2)} CELO` },
          { num: "03", text: "Press the button to reset the timer" },
          { num: "04", text: "If you're last when timer hits zero, claim your prize" },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + idx * 0.1 }}
            className="flex gap-4"
          >
            <div className="bg-celo-yellow border-2 border-black p-4 w-16 h-16 flex items-center justify-center">
              <span className="font-inter font-bold text-lg">{item.num}</span>
            </div>
            <div className="flex-1 pt-4">
              <p className="font-inter font-750 text-celo-brown uppercase text-sm leading-tight">
                {item.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

