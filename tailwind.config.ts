import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#000",
          panel: "#0d0d0d",
        },
        glass: {
          bg: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.1)",
        },
        text: {
          primary: "#999",
          secondary: "#888",
          tertiary: "#666",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        mobile: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
