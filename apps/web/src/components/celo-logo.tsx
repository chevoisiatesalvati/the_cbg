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
      viewBox="0 0 2500 2500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.circle
        cx="1250"
        cy="1250"
        r="1250"
        fill="#FCFF52"
        fillRule="evenodd"
        clipRule="evenodd"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      />
      <motion.path
        d="M1949.3,546.2H550.7v1407.7h1398.7v-491.4h-232.1c-80,179.3-260.1,304.1-466.2,304.1    c-284.1,0-514.2-233.6-514.2-517.5c0-284,230.1-515.6,514.2-515.6c210.1,0,390.2,128.9,470.2,312.1h228.1V546.2z"
        fill="#1A0329"
        fillRule="evenodd"
        clipRule="evenodd"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
    </motion.svg>
  );
}

