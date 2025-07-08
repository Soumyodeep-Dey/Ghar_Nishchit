import React from "react";
import { useTheme } from "../contexts/theme";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="text-center p-4 bg-blue-700 text-white dark:bg-black dark:text-blue-300 flex justify-between items-center">
      <h1 className="m-0">Ghar Nishchit</h1>
      <button
        onClick={toggleTheme}
        className="ml-4 px-4 py-2 rounded border border-gray-300 bg-white text-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:border-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>
  );
};

export default Header;
