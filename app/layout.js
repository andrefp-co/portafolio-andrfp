import { personalData } from "@/utils/data/personal-data";
import { GoogleTagManager } from "@next/third-parties/google";
import { Bebas_Neue, DM_Mono } from "next/font/google";
import Footer from "./components/footer";
import ScrollToTop from "./components/helper/scroll-to-top";
import MotionProvider from "./components/motion/motion-provider";
import Navbar from "./components/navbar";
import "./css/globals.scss";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

const description =
  "Andres Peña is an embedded systems and avionics engineer in the Washington, DC area and the founder of SWORT Aerospace: flight-controller programs, embedded firmware, electronics test, and sensor-integrity research.";

export const metadata = {
  metadataBase: new URL("https://andres.swort.net"),
  title: {
    default: `${personalData.name} | Embedded Systems & Avionics`,
    template: `%s | ${personalData.name}`,
  },
  description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: personalData.name,
    title: `${personalData.name} | Electrical Engineer`,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${personalData.name} | Electrical Engineer`,
    description,
  },
};

export const viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${bebasNeue.variable}`}>
      <body>
        {/* Without JavaScript the dither reveal never runs; never let its
            canvas cover an image in that case. */}
        <noscript>
          <style>{".dither-layer{display:none}"}</style>
        </noscript>
        <MotionProvider>
          <Navbar />
          <main className="min-h-screen relative">
            {children}
            <ScrollToTop />
          </main>
          <Footer />
        </MotionProvider>
      </body>
      {process.env.NEXT_PUBLIC_GTM && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />}
    </html>
  );
}
