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
      <p className="font-medium mb-5 text-[#16f2b3] text-xl uppercase">
        Contact with me
      </p>

      <div className="max-w-3xl text-white rounded-lg border border-[#464c6a] p-3 lg:p-5">
        <p className="text-sm text-[#d3d8e8]">
          If you have any questions or concerns, feel free to reach out. I’m open
          to opportunities that align with my skills and ambitions.
        </p>

        <form onSubmit={handleSendMail} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label>Your Name</label>
            <input
              className="bg-[#10172d] border border-[#353a52] rounded-md px-3 py-2"
              type="text"
              value={userInput.name}
              onChange={(e) =>
                setUserInput({ ...userInput, name: e.target.value })
              }
              onBlur={checkRequired}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>Your Email</label>
            <input
              className="bg-[#10172d] border border-[#353a52] rounded-md px-3 py-2"
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
              <p className="text-sm text-red-400">
                Please provide a valid email.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label>Your Message</label>
            <textarea
              className="bg-[#10172d] border border-[#353a52] rounded-md px-3 py-2"
              rows="4"
              value={userInput.message}
              onChange={(e) =>
                setUserInput({ ...userInput, message: e.target.value })
              }
              onBlur={checkRequired}
            />
          </div>

          {error.required && (
            <p className="text-sm text-red-400">All fields are required.</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-all hover:gap-4"
          >
            {isLoading ? "Sending…" : <>Send Message <TbMailForward size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
