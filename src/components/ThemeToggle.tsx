import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, themeMode, toggleTheme } = useTheme();

  const getLabel = () => {
    if (themeMode === "system") {
      return `System (${theme === "dark" ? "Dark" : "Light"})`;
    }
    return themeMode === "dark" ? "Dark Mode" : "Light Mode";
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        type="button"
        onClick={toggleTheme}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        title={`Theme: ${getLabel()} — Click to switch`}
        aria-label={`Toggle theme, current is ${getLabel()}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={themeMode}
            initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            {themeMode === "system" ? (
              <Monitor className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            ) : theme === "dark" ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Small Mode Pip Indicator */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-950 ${
            themeMode === "system"
              ? "bg-indigo-500"
              : theme === "dark"
              ? "bg-teal-400"
              : "bg-amber-500"
          }`}
        />
      </motion.button>
    </div>
  );
}
