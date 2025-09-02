import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	fontFamily: {
		"context": ["PP Neue Machina Inktrap", "Arial", "sans-serif"],
		"tdn": ["PP Neue Machina Inktrap", "Arial", "sans-serif"]
	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
