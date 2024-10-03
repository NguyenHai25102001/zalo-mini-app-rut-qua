module.exports = {
  purge: {
    enabled: true,
    content: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  },
  theme: {
    extend: {
      keyframes: {
        "zoom-rotate": {
          "0%": { transform: "scale(0.5) rotate(0deg)" },
          "100%": { transform: "scale(1.2) rotate(360deg)" },
        },
      },
      animation: {
        "zoom-rotate": "zoom-rotate 700ms ease-out forwards ",
      },
    },
  },
  variants: {},
  plugins: [],
};
