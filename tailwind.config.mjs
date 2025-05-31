const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 這裡可以自訂顏色、字型、斷點等
      colors: {
        primary: "#BEC4C4",
        secondary:"#6A717B",
        focusOutline:"#BEC4C4",
        success:"#9EA6A9",
        light:"#E0E3E8"
      },
      fontFamily: {
        sans: ["Noto Sans TC", "Noto Sans"],
      },
    },
  },
  plugins: [],
};

export default config;
