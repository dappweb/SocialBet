import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '../utils';

interface CountdownTimerProps {
  endDate: string | Date;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endDate,
  className,
  showIcon = true,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  const targetDate = useMemo(() => new Date(endDate), [endDate]);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const isExpired = timeLeft.total <= 0;
  const isUrgent = timeLeft.total > 0 && timeLeft.days === 0 && timeLeft.hours < 24;
  const isVeryUrgent = timeLeft.total > 0 && timeLeft.days === 0 && timeLeft.hours < 1;

  if (isExpired) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
        "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
        className
      )}>
        {showIcon && <AlertCircle size={12} />}
        <span>Ended</span>
      </div>
    );
  }

  const formatDisplay = () => {
    if (compact) {
      if (timeLeft.days > 0) {
        return `${timeLeft.days}d ${timeLeft.hours}h`;
      }
      if (timeLeft.hours > 0) {
        return `${timeLeft.hours}h ${timeLeft.minutes}m`;
      }
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }

    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
    }
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }
    return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
  };

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
      isVeryUrgent 
        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
        : isUrgent
          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
          : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      className
    )}>
      {showIcon && <Clock size={12} />}
      <span>{formatDisplay()}</span>
    </div>
  );
};

export default CountdownTimer;
