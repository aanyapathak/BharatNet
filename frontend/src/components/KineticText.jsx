import React, { useState, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#/%$&";

export default function KineticText({ text, className = "", duration = 1200, delay = 0 }) {
  const [displayText, setDisplayText] = useState("");
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    let timeoutId;
    let intervalId;
    let startTime;

    const startAnimation = () => {
      startTime = Date.now();
      const targetLength = text.length;

      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const resolvedCharsCount = Math.floor(progress * targetLength);

        let result = "";
        for (let i = 0; i < targetLength; i++) {
          if (text[i] === " " || text[i] === "\n") {
            result += text[i];
          } else if (i < resolvedCharsCount) {
            result += text[i];
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        setDisplayText(result);

        if (progress >= 1) {
          clearInterval(intervalId);
          setDisplayText(text);
          setIsResolved(true);
        }
      }, 40);
    };

    timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, duration, delay]);

  return (
    <span className={`${className} ${!isResolved ? "opacity-90 font-mono tracking-wider" : "transition-all duration-300"}`}>
      {displayText || text}
    </span>
  );
}
