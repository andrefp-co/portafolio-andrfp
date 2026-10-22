import { personalData } from "@/utils/data/personal-data";
import { OG_IMAGE, SITE_URL } from "@/utils/seo";
import { GoogleTagManager } from "@next/third-parties/google";
import { Bebas_Neue, DM_Mono } from "next/font/google";
import Footer from "./components/footer";
import ScrollToTop from "./components/helper/scroll-to-top";
import MotionProvider from "./components/motion/motion-provider";
import Navbar from "./components/navbar";
import Toaster from "./components/helper/toaster";
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
  "Andres Peña: embedded systems and avionics engineer, founder of SWORT Aerospace. Flight controllers, firmware, electronics test and sensor integrity.";

const title = `${personalData.name} | Embedded Systems & Avionics`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s | ${personalData.name}`,
  },
  description,
  applicationName: personalData.name,
  authors: [{ name: personalData.name, url: SITE_URL }],
  creator: personalData.name,
  publisher: "SWORT Aerospace",
  keywords: [
    "Andres Peña", "Andres Pena", "SWORT Aerospace", "embedded systems engineer", "avionics engineer",
    "flight controller", "STM32", "PCB design", "sensor integrity", "CSIA", "runtime diagnosis",
    "Shell Eco-marathon", "Purdue Space Program", "Washington DC",
  ],
  category: "technology",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    url: "/",
    siteName: personalData.name,
    title,
    description,
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@andrfpco",
    images: [OG_IMAGE.url],
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${bebasNeue.variable}`}>
      <body>
        {/* Without JavaScript the image reveals never run; show the images
            as they are instead of leaving them clipped. */}
        <noscript>
          <style>{"[data-reveal]{clip-path:none!important;transform:none!important}"}</style>
        </noscript>
        <MotionProvider>
          <Navbar />
          <main className="min-h-screen relative">
            {children}
            <ScrollToTop />
            <Toaster />
          </main>
          <Footer />
        </MotionProvider>
      </body>
      {process.env.NEXT_PUBLIC_GTM && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />}
    </html>
  );
}
