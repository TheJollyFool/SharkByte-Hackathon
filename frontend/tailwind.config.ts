import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shark: { 50: "#eef7ff", 100: "#d6ebff", 500: "#1d7fd6", 600: "#1666b0", 900: "#0b2a47" },
        // WhatsApp-ish chat backdrop
        chat: { bg: "#efeae2", student: "#d9fdd3" },
        // Flowchart box colors by Step.kind
        kind: {
          mdc_program: "#1d7fd6",
          certification: "#7c3aed",
          exam: "#d97706",
          internship: "#059669",
          transfer: "#db2777",
          degree: "#0f766e",
          other: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
