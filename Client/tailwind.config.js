/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "50px",
      sm: "350px",
      md: "570px",
      lg: "970px",
      xl: "1200px",
    },
    extend: {
      colors: {
        primary: "#2e77ae",
        "primary-subtle": "#255f87",
        secondary: "#ff8e2b",
        "secondary-subtle": "#cc721e",
        accent: "#0d2237",
        "accent-subtle": "#0a1a2a",
        neutral: "#F5F7FA",
        "neutral-subtle": "#cdd2da",
        base: "#e0eaf4",
        "base-subtle": "#b2c2d4",
        danger: "#ef4840",
        "danger-subtle": "#c03b34",
        success: "#3ab34a",
        "success-subtle": "#2d8c39",
      },
      boxShadow: {
        custom: "0px 0px 12px 2px rgba(0,0,0,0.75);", // Ganti nilai sesuai kebutuhan
      },
      fontSize: {
        md: "1.125rem",
      },
    },
  },
  plugins: [],
  server: {
    port: 2024, // Ganti dengan port yang kamu inginkan
  },
};
