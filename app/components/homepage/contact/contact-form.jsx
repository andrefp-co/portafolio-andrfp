"use client";
// @flow strict
import { isValidEmail } from "@/utils/check-email";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TbMailForward } from "react-icons/tb";
import ProtectedEmail from "../../helper/protected-email";
import { PREVIEW } from "@/utils/preview";

const EMPTY = { name: "", email: "", message: "" };

function ContactForm() {
  const [error, setError] = useState({ email: false, required: false });
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [userInput, setUserInput] = useState(EMPTY);
  // Spam signals the server checks: when the form was first shown, and a
  // hidden field that only bots fill in.
  const shownAt = useRef(0);
  const honeypot = useRef(null);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  const isSending = status.state === "sending";

  const update = (field) => (e) => {
    setUserInput((prev) => ({ ...prev, [field]: e.target.value }));
    if (status.state !== "idle" && status.state !== "sending") setStatus({ state: "idle", message: "" });
  };

  const checkRequired = () => {
    if (userInput.name && userInput.email && userInput.message) {
      setError((prev) => ({ ...prev, required: false }));
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();

    if (!userInput.name || !userInput.email || !userInput.message) {
      setError((prev) => ({ ...prev, required: true }));
      return;
    }

    if (!isValidEmail(userInput.email)) {
      setError((prev) => ({ ...prev, email: true }));
      return;
    }

    if (PREVIEW) {
      setStatus({ state: "error", message: "This preview has no server, so it can't send messages. The form sends from andres.swort.net." });
      return;
    }

    try {
      setStatus({ state: "sending", message: "" });
      await axios.post("/api/contact", {
        ...userInput,
        website: honeypot.current?.value ?? "",
        elapsed: Date.now() - shownAt.current,
      });
      setStatus({ state: "sent", message: "Message sent. I'll reply to the address you gave." });
      setUserInput(EMPTY);
    } catch (err) {
      setStatus({
        state: "error",
        message: err?.response?.data?.message || "Your message didn't go through. Email me directly instead.",
      });
    }
  };

  return (
    <div className="min-w-0">
      <div className="sw-paper max-w-3xl border border-[var(--sw-border)] p-6 lg:p-8">
        <p className="sw-lede">
          If you have any questions or concerns, feel free to reach out. I’m open
          to opportunities that align with my skills and ambitions.
        </p>

        <form onSubmit={handleSendMail} className="mt-8 flex flex-col gap-5" noValidate>
          {/* Honeypot: hidden from people and assistive tech, filled by bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="contact-website">Website</label>
            <input ref={honeypot} id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-name" className="sw-label">Your Name</label>
            <input
              id="contact-name"
              className="sw-field"
              type="text"
              autoComplete="name"
              aria-invalid={(error.required && !userInput.name) || undefined}
              aria-describedby={error.required && !userInput.name ? "contact-required-error" : undefined}
              value={userInput.name}
              onChange={update("name")}
              onBlur={checkRequired}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-email" className="sw-label">Your Email</label>
            <input
              id="contact-email"
              className="sw-field"
              type="email"
              autoComplete="email"
              aria-invalid={error.email || (error.required && !userInput.email) || undefined}
              aria-describedby={error.email ? "contact-email-error" : error.required && !userInput.email ? "contact-required-error" : undefined}
              value={userInput.email}
              onChange={update("email")}
              onBlur={() =>
                setError((prev) => ({
                  ...prev,
                  email: Boolean(userInput.email) && !isValidEmail(userInput.email),
                }))
              }
            />
            {error.email && (
              <p id="contact-email-error" className="sw-field-error">
                Enter a valid email address, like name@example.com.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-message" className="sw-label">Your Message</label>
            <textarea
              id="contact-message"
              className="sw-field"
              rows="5"
              aria-invalid={(error.required && !userInput.message) || undefined}
              aria-describedby={error.required && !userInput.message ? "contact-required-error" : undefined}
              value={userInput.message}
              onChange={update("message")}
              onBlur={checkRequired}
            />
          </div>

          {error.required && (
            <p id="contact-required-error" role="alert" className="sw-field-error">
              Fill in your name, email and message.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="submit"
              disabled={isSending}
              className="sw-btn sw-btn-primary"
            >
              {isSending ? "Sending…" : <>Send message <TbMailForward size={16} /></>}
            </button>

            <AnimatePresence mode="wait">
              {(status.state === "sent" || status.state === "error") && (
                <motion.p
                  key={status.state}
                  role="status"
                  className={`text-xs leading-relaxed ${status.state === "sent" ? "text-[var(--sw-silver)]" : "text-[var(--sw-danger-text)]"}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {status.message}
                  {status.state === "error" && (
                    <>
                      {" "}
                      <ProtectedEmail link className="underline underline-offset-4" />
                    </>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
