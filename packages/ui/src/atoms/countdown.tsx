"use client";

import React, { useState, useEffect } from "react";
import { colors, typography, fontSizes, letterSpacing } from "../tokens.js";

export interface CountdownProps {
  /** Target date/time to count down to */
  targetDate: Date;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
  /** Visual variant */
  variant?: "default" | "compact" | "large";
  /** Show labels (days, hours, etc.) */
  showLabels?: boolean;
  /** Invert colors (white on black) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function Countdown({
  targetDate,
  onComplete,
  variant = "default",
  showLabels = true,
  inverted = false,
  className = "",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        setIsComplete(true);
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const bgColor = inverted ? colors.black : colors.white;
  const textColor = inverted ? colors.white : colors.black;
  const borderColor = inverted ? colors.white : colors.black;

  const sizeStyles = {
    default: {
      container: { gap: "1rem" },
      number: { fontSize: fontSizes.h2MD, padding: "1rem 1.25rem" },
      label: { fontSize: fontSizes.monoSM },
    },
    compact: {
      container: { gap: "0.5rem" },
      number: { fontSize: fontSizes.h4MD, padding: "0.5rem 0.75rem" },
      label: { fontSize: fontSizes.monoXS },
    },
    large: {
      container: { gap: "1.5rem" },
      number: { fontSize: fontSizes.h1MD, padding: "1.5rem 2rem" },
      label: { fontSize: fontSizes.monoMD },
    },
  };

  const styles = sizeStyles[variant];

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          fontFamily: typography.heading,
          fontSize: styles.number.fontSize,
          fontWeight: 400,
          color: textColor,
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          padding: styles.number.padding,
          minWidth: variant === "large" ? "5rem" : variant === "compact" ? "2.5rem" : "3.5rem",
          textAlign: "center",
          letterSpacing: letterSpacing.wide,
          textTransform: "uppercase",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      {showLabels && (
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: styles.label.fontSize,
            color: inverted ? colors.grey400 : colors.grey600,
            textTransform: "uppercase",
            letterSpacing: letterSpacing.widest,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );

  const Separator = () => (
    <span
      style={{
        fontFamily: typography.heading,
        fontSize: styles.number.fontSize,
        color: textColor,
        alignSelf: showLabels ? "flex-start" : "center",
        paddingTop: showLabels ? styles.number.padding : "0",
      }}
    >
      :
    </span>
  );

  if (isComplete) {
    return (
      <div
        className={className}
        style={{
          fontFamily: typography.heading,
          fontSize: styles.number.fontSize,
          color: textColor,
          textTransform: "uppercase",
          letterSpacing: letterSpacing.wide,
          textAlign: "center",
        }}
      >
        EXPIRED
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: styles.container.gap,
      }}
    >
      {timeLeft.days > 0 && (
        <>
          <TimeUnit value={timeLeft.days} label="Days" />
          <Separator />
        </>
      )}
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <Separator />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <Separator />
      <TimeUnit value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

export default Countdown;
