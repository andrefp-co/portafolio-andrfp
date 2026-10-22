"use client";

import { forwardRef } from "react";

// The rendered markdown. Code blocks arrive from the server with a Copy
// button (see utils/content.js); one delegated click handler wires them all.
const ArticleBody = forwardRef(function ArticleBody({ html, className = "" }, ref) {
  const onClick = async (e) => {
    const button = e.target.closest?.("[data-copy]");
    if (!button) return;
    const code = button.parentElement?.querySelector("pre")?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select and copy";
    }
    button.setAttribute("data-copied", "");
    setTimeout(() => {
      button.textContent = "Copy";
      button.removeAttribute("data-copied");
    }, 1600);
  };

  return <article ref={ref} className={`sw-prose min-w-0 ${className}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
});

export default ArticleBody;
