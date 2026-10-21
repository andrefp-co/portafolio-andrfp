"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";

const DEFAULT_BTN_CLS =
  "fixed bottom-8 right-6 z-50 flex h-11 w-11 items-center justify-center border border-[var(--sw-gray)] bg-[var(--sw-black)] text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-black";
const SCROLL_THRESHOLD = 50;

const ScrollToTop = () => {
  const [btnCls, setBtnCls] = useState(DEFAULT_BTN_CLS + " hidden");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        setBtnCls(DEFAULT_BTN_CLS.replace(" hidden", ""));
      } else {
        setBtnCls(DEFAULT_BTN_CLS + " hidden");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { passive: true });
    };
  }, []);

  const onClickBtn = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button className={btnCls} onClick={onClickBtn} aria-label="Scroll to top">
      <FaArrowUp size={14} />
    </button>
  );
};

export default ScrollToTop;
