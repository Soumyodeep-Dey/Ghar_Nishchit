import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="text-center p-4 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <p>&copy; {year} Ghar Nishchit. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
