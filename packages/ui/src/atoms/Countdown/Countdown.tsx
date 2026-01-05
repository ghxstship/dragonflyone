"use client";

import React, { useState, useEffect } from "react";
import { countdownVariants, timeUnitVariants, timeLabelVariants, separatorVariants, expiredVariants } from "./Countdown.variants.js";
import type { CountdownProps, TimeLeft, TimeUnitProps } from "./Countdown.types.js";

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

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label, variant, showLabels, inverted }) => (
  <div className="flex flex-col items-center gap-gap-xs">
    <div className={timeUnitVariants({ variant, inverted })}>
      {String(value).padStart(2, "0")}
    </div>
    {showLabels && (
      <span className={timeLabelVariants({ variant, inverted })}>
        {label}
      </span>
    )}
  </div>
);

const Separator: React.FC<{ variant: "default" | "compact" | "large"; showLabels: boolean; inverted: boolean }> = ({
  variant,
  showLabels,
  inverted,
}) => (
  <span className={separatorVariants({ variant, showLabels, inverted })}>
    :
  </span>
);

/**
 * Countdown component
 * 
 * A countdown timer component that displays time remaining until a target date.
 * Uses design tokens via CSS custom properties for consistent styling across
 * themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Countdown targetDate={new Date("2024-12-31")} variant="default" />
 * <Countdown targetDate={new Date("2024-12-31")} variant="compact" showLabels={false} />
 * <Countdown targetDate={new Date("2024-12-31")} variant="large" inverted />
 * ```
 */
export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  onComplete,
  variant = "default",
  showLabels = true,
  inverted = false,
  className = "",
}) => {
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

  if (isComplete) {
    return (
      <div
        className={expiredVariants({ variant, inverted, className })}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        EXPIRED
      </div>
    );
  }

  return (
    <div
      className={countdownVariants({ variant, className })}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Countdown: ${timeLeft.days > 0 ? `${timeLeft.days} days, ` : ''}${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`}
    >
      {timeLeft.days > 0 && (
        <>
          <TimeUnit value={timeLeft.days} label="Days" variant={variant} showLabels={showLabels} inverted={inverted} />
          <Separator variant={variant} showLabels={showLabels} inverted={inverted} />
        </>
      )}
      <TimeUnit value={timeLeft.hours} label="Hours" variant={variant} showLabels={showLabels} inverted={inverted} />
      <Separator variant={variant} showLabels={showLabels} inverted={inverted} />
      <TimeUnit value={timeLeft.minutes} label="Mins" variant={variant} showLabels={showLabels} inverted={inverted} />
      <Separator variant={variant} showLabels={showLabels} inverted={inverted} />
      <TimeUnit value={timeLeft.seconds} label="Secs" variant={variant} showLabels={showLabels} inverted={inverted} />
    </div>
  );
};

export default Countdown;
