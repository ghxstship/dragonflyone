"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";

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

const sizeConfig = {
  default: {
    container: "gap-4",
    number: "text-h2-md px-5 py-4 min-w-14",
    label: "text-mono-sm",
  },
  compact: {
    container: "gap-2",
    number: "text-h4-md px-3 py-2 min-w-10",
    label: "text-mono-xs",
  },
  large: {
    container: "gap-6",
    number: "text-h1-md px-8 py-6 min-w-20",
    label: "text-mono-md",
  },
};

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

  const config = sizeConfig[variant];

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-2">
      <div
        className={clsx(
          "font-heading font-normal border-2 text-center tracking-wide uppercase",
          config.number,
          inverted
            ? "bg-black text-white border-white"
            : "bg-white text-black border-black"
        )}
      >
        {String(value).padStart(2, "0")}
      </div>
      {showLabels && (
        <span
          className={clsx(
            "font-code uppercase tracking-widest",
            config.label,
            inverted ? "text-grey-400" : "text-grey-600"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );

  const Separator = () => (
    <span
      className={clsx(
        "font-heading",
        variant === "large" ? "text-h1-md" : variant === "compact" ? "text-h4-md" : "text-h2-md",
        showLabels ? "self-start pt-4" : "self-center",
        inverted ? "text-white" : "text-black"
      )}
    >
      :
    </span>
  );

  if (isComplete) {
    return (
      <div
        className={clsx(
          "font-heading uppercase tracking-wide text-center",
          variant === "large" ? "text-h1-md" : variant === "compact" ? "text-h4-md" : "text-h2-md",
          inverted ? "text-white" : "text-black",
          className
        )}
      >
        EXPIRED
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-start justify-center",
        config.container,
        className
      )}
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
