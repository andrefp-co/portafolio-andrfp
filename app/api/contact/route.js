import emailjs from '@emailjs/browser';

export default function ContactForm() {
  const sendEmail = async (e) => {
    e.preventDefault();
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,   // service ID
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,  // template ID
        e.target,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY   // public key
      );
      alert('Email sent!');
    } catch (error) {
      console.error(error);
      alert('Failed to send email.');
    }
  };

  return (
    <form onSubmit={sendEmail}>
      <input name="name" required placeholder="Your Name" />
      <input name="email" required placeholder="Your Email" />
      <textarea name="message" required placeholder="Your Message" />
      <button type="submit">Send</button>
    </form>
  );
}


