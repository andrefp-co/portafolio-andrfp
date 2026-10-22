// @flow strict

import Link from "next/link";

function page() {
  return (
    <section className="sw-bg-grid">
      <div className="sw-container flex min-h-[70vh] flex-col items-start justify-center py-20">
        <p className="sw-eyebrow">Error 404</p>
        <h1 className="sw-display">Page not found.</h1>
        <p className="sw-lede mt-6">Sorry, the page you are looking for does not exist.</p>
        <Link className="sw-btn sw-btn-primary mt-10" href="/">
          Go to home
        </Link>
      </div>
    </section>
  );
};

export default page;
