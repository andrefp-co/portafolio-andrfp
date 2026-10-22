import { personalData } from "@/utils/data/personal-data";
import { GoogleTagManager } from "@next/third-parties/google";
import { Bebas_Neue, DM_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/footer";
import ScrollToTop from "./components/helper/scroll-to-top";
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
  "Andres Peña is an electrical engineering student and full-stack developer in the Washington, DC area, working on embedded firmware, avionics, and aerospace R&D.";

export const metadata = {
  metadataBase: new URL("https://andres.swort.net"),
  title: {
    default: `${personalData.name} | Electrical Engineer`,
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
        <ToastContainer theme="dark" />
        <Navbar />
        <main className="min-h-screen relative">
          {children}
          <ScrollToTop />
        </main>
        <Footer />
      </body>
      {process.env.NEXT_PUBLIC_GTM && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />}
    </html>
  );
}
