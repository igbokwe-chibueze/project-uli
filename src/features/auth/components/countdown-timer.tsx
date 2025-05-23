// src/features/auth/components/countdown-timer.tsx

import { useEffect, useState } from "react";

// Define the props for the CountdownTimer component.
// - initialTime: The starting number of seconds for the countdown.
// - onExpire: A callback function to be invoked when the countdown reaches zero.
interface CountdownTimerProps {
    initialTime: number;
    onExpire: () => void;
}

// CountdownTimer is a functional React component that displays a countdown timer.
// It decreases the time left every second and calls onExpire when the countdown finishes.
export const CountdownTimer = ({ initialTime, onExpire } : CountdownTimerProps) => {
  // State to keep track of the remaining time (in seconds).
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    // If no time is left, invoke the onExpire callback and exit early.
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    // Set up an interval to decrease the time left by 1 every second (1000ms).
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or when timeLeft/onExpire changes.
    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  // Calculate minutes and seconds from the total seconds left.
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Render the formatted countdown timer.
  return (
    //.padStart(2, "0") method ensures that the string representation of the seconds always has at least two characters. 
    // For instance, if the seconds value is "5", it will be padded to "05". 
    <div className="text-sm text-muted-foreground">
      Code expires in: {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
};
