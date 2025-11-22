import { motion } from "framer-motion";

interface CeloLogoProps {
  size?: number;
  className?: string;
}

export function CeloLogo({ size = 80, className = "" }: CeloLogoProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* CELO Logo - Simplified geometric version */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="#FCFF52"
        stroke="#1A0329"
        strokeWidth="2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      />
      <motion.path
        d="M 30 50 Q 50 30, 70 50 Q 50 70, 30 50"
        fill="#4E632A"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="15"
        fill="#1A0329"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
      />
    </motion.svg>
  );
}

