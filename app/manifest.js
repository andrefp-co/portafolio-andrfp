import { personalData } from "@/utils/data/personal-data";

export default function manifest() {
  return {
    name: `${personalData.name} | Embedded Systems & Avionics`,
    short_name: personalData.name,
    description: "Engineering portfolio of Andres Peña: flight controllers, sensor integrity and electronics test.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/favicon.ico", sizes: "64x64 48x48 32x32 16x16", type: "image/x-icon" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
