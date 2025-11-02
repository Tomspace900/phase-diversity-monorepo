import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check localStorage et system preference
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initial =
      stored === "dark" || (!stored && prefersDark) ? "dark" : "light";

    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      variant="icon"
      size="md"
      color="secondary"
      onClick={toggleTheme}
      className="relative"
      aria-label="Toggle theme"
      icon={theme === "light" ? Sun01Icon : Moon02Icon}
    ></Button>
  );
}
