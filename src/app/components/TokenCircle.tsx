"use client";

import { Avatar } from "antd";
import { motion } from "framer-motion";
import { tokenImages } from "../constants";

interface TokenCircleProps {
  circleRadius?: number;
  clockwise?: boolean;
}

export const TokenCircle = ({
  circleRadius = 200,
  clockwise = true,
}: TokenCircleProps) => {
  return (
    <motion.div
      className="relative w-64 h-64 mx-auto mt-20"
      animate={{
        rotate: clockwise ? 360 : -360,
      }}
      transition={{
        repeat: Infinity,
        duration: 20,
        ease: "linear",
      }}
    >
      {tokenImages.map((image, index) => {
        const angle = (index / tokenImages.length) * 360;
        const x = circleRadius * Math.cos((angle * Math.PI) / 180);
        const y = circleRadius * Math.sin((angle * Math.PI) / 180);

        return (
          <Avatar
            key={index}
            className="absolute w-16 h-16 rounded-full"
            style={{
              top: `calc(50% + ${y}px - 20px)`,
              left: `calc(50% + ${x}px - 20px)`,
            }}
            src={image}
            alt={`token-${index}`}
          />
        );
      })}
    </motion.div>
  );
};
