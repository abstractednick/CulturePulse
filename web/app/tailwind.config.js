export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050508",
        surface: "#12121A",
        raised: "#1C1C28",
        lime: "#D6FF3F",
        pink: "#FF4F8B",
        violet: "#9B8CFF",
        paper: "#F4F1EA",
        mute: "#8B8798",
      },
      fontFamily: {
        display: ["Syne", "ui-sans-serif", "system-ui"],
        sans: ["Outfit", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(214, 255, 63, 0.18)",
      },
    },
  },
  plugins: [],
};
