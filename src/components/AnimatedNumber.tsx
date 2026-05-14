import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
}

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value === prev.current) return;
    prev.current = value;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 600);
    return () => window.clearTimeout(id);
  }, [value]);

  return (
    <span className={"animated-num" + (flash ? " is-flash" : "")}>{value}</span>
  );
}
