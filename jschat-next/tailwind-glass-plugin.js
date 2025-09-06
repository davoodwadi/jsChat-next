// tailwind-glass-plugin.js
const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addUtilities, theme }) {
  const glassUtilities = {
    ".glass-base": {
      "backdrop-filter": "blur(32px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      "box-shadow": "0 8px 32px rgba(0, 0, 0, 0.12)",
      background: "rgba(255, 255, 255, 0.1)",
      "@media (prefers-color-scheme: dark)": {
        background: "rgba(0, 0, 0, 0.2)",
        "border-color": "rgba(255, 255, 255, 0.1)",
      },
    },
    ".glass-subtle": {
      "backdrop-filter": "blur(16px)",
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      "box-shadow": "0 4px 16px rgba(0, 0, 0, 0.08)",
      "@media (prefers-color-scheme: dark)": {
        background: "rgba(0, 0, 0, 0.1)",
        "border-color": "rgba(255, 255, 255, 0.08)",
      },
    },
    ".glass-strong": {
      "backdrop-filter": "blur(48px)",
      background: "rgba(255, 255, 255, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      "box-shadow": "0 12px 40px rgba(0, 0, 0, 0.16)",
      "@media (prefers-color-scheme: dark)": {
        background: "rgba(0, 0, 0, 0.3)",
        "border-color": "rgba(255, 255, 255, 0.15)",
      },
    },
  };

  addUtilities(glassUtilities);
});
