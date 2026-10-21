/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // コンテンツ最大幅 1200px + ガター
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", md: "2rem", lg: "3rem" }, // 24/32/48
      screens: { "2xl": "1200px" },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F1724",
          900: "#0B121C", // footer
          800: "#16202F", // dark surface
          700: "#1F2C3D", // raised
        },
        accent: {
          cyan: { DEFAULT: "#00D1FF", 600: "#00A6CC" },
          purple: { DEFAULT: "#7C4DFF", 600: "#5E35E0" },
        },
        muted: "#F3F4F6",
        neutral: {
          0: "#FFFFFF", 50: "#F9FAFB", 100: "#F3F4F6", 200: "#E5E7EB",
          300: "#D1D5DB", 400: "#9CA3AF", 500: "#6B7280", 600: "#4B5563",
          700: "#374151", 800: "#1F2937", 900: "#111827",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: { DEFAULT: "#EF4444", light: "#FF6B6B" },
        info: "#00D1FF",
      },
      fontFamily: {
        display: ['"Neue Haas Grotesk Display"', "var(--font-inter)", '"Noto Sans JP"', "sans-serif"],
        sans: ["var(--font-inter)", "var(--font-noto-sans-jp)", '"Noto Sans JP"', "sans-serif"],
      },
      // [fontSize, { lineHeight, letterSpacing, fontWeight }]
      fontSize: {
        display:  ["4rem",     { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        h1:       ["3rem",     { lineHeight: "1.1",  letterSpacing: "-0.025em", fontWeight: "700" }],
        h2:       ["2.25rem",  { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        h3:       ["1.75rem",  { lineHeight: "1.2",  letterSpacing: "-0.015em", fontWeight: "600" }],
        h4:       ["1.375rem", { lineHeight: "1.3",  letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg":["1.125rem", { lineHeight: "1.6" }],
        body:     ["1rem",     { lineHeight: "1.7" }],
        "body-sm":["0.875rem", { lineHeight: "1.6" }],
        caption:  ["0.75rem",  { lineHeight: "1.5", letterSpacing: "0.02em", fontWeight: "500" }],
        overline: ["0.75rem",  { lineHeight: "1.4", letterSpacing: "0.12em", fontWeight: "600" }],
      },
      spacing: {
        // 4pxベース（Tailwin既定の 1=4px と整合、追加分のみ補完）
        18: "4.5rem",  // 72px (header)
        30: "7.5rem",  // 120px (hero top)
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        card: "16px",   // = radius-lg
        xl: "24px",
        "2xl": "32px",
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(15,23,36,0.06)",
        sm: "0 2px 8px rgba(15,23,36,0.08)",
        md: "0 8px 24px rgba(15,23,36,0.12)",
        lg: "0 16px 48px rgba(15,23,36,0.18)",
        "glow-cyan": "0 0 0 1px rgba(0,209,255,0.4), 0 8px 32px rgba(0,209,255,0.25)",
        "glow-purple": "0 8px 32px rgba(124,77,255,0.30)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(90deg, #00D1FF 0%, #7C4DFF 100%)",
        "gradient-hero":
          "radial-gradient(60% 60% at 75% 20%, rgba(124,77,255,0.35) 0%, rgba(124,77,255,0) 70%), radial-gradient(50% 50% at 10% 80%, rgba(0,209,255,0.30) 0%, rgba(0,209,255,0) 70%), linear-gradient(180deg, #0F1724 0%, #0B121C 100%)",
        "gradient-glow":
          "radial-gradient(120% 120% at 50% 0%, rgba(0,209,255,0.12) 0%, rgba(0,209,255,0) 60%)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        emphasized: "cubic-bezier(0.2, 0, 0, 1)",
      },
      maxWidth: {
        content: "1200px",
        prose: "70ch",
        form: "640px",
        lead: "560px",
      },
      ringColor: { focus: "#00D1FF" },
      ringWidth: { focus: "2px" },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
