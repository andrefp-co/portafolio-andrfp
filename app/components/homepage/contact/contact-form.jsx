"use client";
// @flow strict
import { isValidEmail } from "@/utils/check-email";
import axios from "axios";
import { useState } from "react";
import { TbMailForward } from "react-icons/tb";
import { toast } from "react-toastify";

function ContactForm() {
  const [error, setError] = useState({ email: false, required: false });
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    message: "",
  });

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

    try {
      setIsLoading(true);

      await axios.post("/api/contact", userInput);

      toast.success("Message sent successfully!");
      setUserInput({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-3xl border border-[var(--sw-border)] bg-[var(--sw-black-raised)] p-6 lg:p-8">
        <p className="sw-lede">
          If you have any questions or concerns, feel free to reach out. I’m open
          to opportunities that align with my skills and ambitions.
        </p>

        <form onSubmit={handleSendMail} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-name" className="sw-label">Your Name</label>
            <input
              id="contact-name"
              className="sw-field"
              type="text"
              value={userInput.name}
              onChange={(e) =>
                setUserInput({ ...userInput, name: e.target.value })
              }
              onBlur={checkRequired}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-email" className="sw-label">Your Email</label>
            <input
              id="contact-email"
              className="sw-field"
              type="email"
              value={userInput.email}
              onChange={(e) =>
                setUserInput({ ...userInput, email: e.target.value })
              }
              onBlur={() =>
                setError((prev) => ({
                  ...prev,
                  email: !isValidEmail(userInput.email),
                }))
              }
            />
            {error.email && (
              <p className="sw-field-error">
                Please provide a valid email.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-message" className="sw-label">Your Message</label>
            <textarea
              id="contact-message"
              className="sw-field"
              rows="5"
              value={userInput.message}
              onChange={(e) =>
                setUserInput({ ...userInput, message: e.target.value })
              }
              onBlur={checkRequired}
            />
          </div>

          {error.required && (
            <p className="sw-field-error">All fields are required.</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="sw-btn sw-btn-primary self-start"
          >
            {isLoading ? "Sending…" : <>Send Message <TbMailForward size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
