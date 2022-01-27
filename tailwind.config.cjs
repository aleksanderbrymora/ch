module.exports = {
  content: ["./app/**/*.{ts,tsx,css}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        sheet: "auto minmax(10rem, 20rem)",
        "word-row": "1fr min-content 1fr 5rem",
      },
    },
  },
  variants: {},
  plugins: [],
};
