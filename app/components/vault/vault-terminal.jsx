"use client";

import { TERMS_VERSION, terms } from "@/utils/data/vault-terms";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Dossier from "./dossier";
import Radar from "./radar";

// The restricted terminal: a radar-scope system check, an access agreement
// the visitor signs with their name, then the access code. The code and the
// agreement are checked by /api/vault on the server; this component never
// sees vault content until the server sends it.

const EASE = [0.22, 1, 0.36, 1];
const MAX_ATTEMPTS = 3;
const LOCKOUT_S = 10;

const STEPS = ["System check", "Terms", "Authenticate", "Access"];
const stepOf = (phase) => ({ boot: 0, terms: 1, code: 2, verifying: 2, granted: 3, open: 3 })[phase];

const BOOT = [
  ["SWORT restricted terminal 2.0", "head"],
  ["session: signed, expires after 8 h", "dim"],
  ["imu0 / imu1: online at 400 Hz", "ok"],
  ["gnss0: raw stream, integrity monitor armed", "ok"],
  ["csia: trust graph loaded (8 nodes, 11 edges)", "ok"],
  ["scope: 4 tracks, sweep 15 rpm", "ok"],
  ["access restricted: accept the terms before you authenticate", "warn"],
];

const subscribeSecond = (onTick) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const secondSnapshot = () => Math.floor(Date.now() / 1000);

function ZuluClock() {
  const s = useSyncExternalStore(subscribeSecond, secondSnapshot, () => null);
  if (s === null) return <span>&nbsp;</span>;
  const iso = new Date(s * 1000).toISOString();
  return (
    <time className="tabular-nums" dateTime={iso}>
      <span className="hidden sm:inline">{iso.slice(0, 10)} </span>
      {iso.slice(11, 19)}Z
    </time>
  );
}

const panel = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const fieldClass =
  "mt-2 w-full border-0 border-b border-white/25 bg-transparent px-0 py-2 text-[15px] text-white outline-none transition-colors placeholder:text-[#5f5f5f] focus:border-white";

export default function VaultTerminal({ authorized = false, viewer = null, content = null, demoCode, demoContent }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("boot");
  const [bootCount, setBootCount] = useState(0);
  const [restored, setRestored] = useState(authorized);
  const [name, setName] = useState(viewer?.name ?? "");
  const [org, setOrg] = useState(viewer?.org ?? "");
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [lockout, setLockout] = useState(0);
  const [error, setError] = useState("");
  const [radarMode, setRadarMode] = useState("scan");
  const [log, setLog] = useState([]);
  const [demoViewer, setDemoViewer] = useState(null);
  const [formScope, animateForm] = useAnimate();
  const timers = useRef([]);
  const grantStarted = useRef(false);
  const codeRef = useRef(null);

  const activeViewer = viewer || demoViewer;
  const dossier = content || (demoViewer ? demoContent : null);
  const canAccept = agreed && name.trim().length >= 2;

  // Sequence timers collapse to zero under reduced motion; real waits such as
  // the lockout countdown pass `always` and keep their duration.
  const later = useCallback((fn, ms, always = false) => {
    timers.current.push(setTimeout(fn, reduce && !always ? 0 : ms));
  }, [reduce]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  // System check, played once on arrival; a restored session runs it fast.
  useEffect(() => {
    let t = 0;
    BOOT.forEach((_, i) => {
      t += authorized ? 70 : 240 + Math.random() * 200;
      later(() => setBootCount(i + 1), t);
    });
    later(() => setPhase(authorized ? "verifying" : "terms"), t + (authorized ? 250 : 800));
    // Plays once; the props it reads are fixed for the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipBoot = () => {
    if (phase !== "boot") return;
    clearTimers();
    setBootCount(BOOT.length);
    setPhase(authorized ? "verifying" : "terms");
  };

  // Once the server has sent the dossier, lock on and open it.
  useEffect(() => {
    if (phase !== "verifying" || !dossier || grantStarted.current) return;
    grantStarted.current = true;
    const who = activeViewer?.name ? `${activeViewer.name}${activeViewer.org ? `, ${activeViewer.org}` : ""}` : "viewer";
    const steps = [
      restored ? "session restored" : "access code accepted",
      `terms v${TERMS_VERSION} on record for ${who}`,
      "session signed, expires in 8 h",
      "decrypting file",
    ];
    later(() => setRadarMode("lock"), 0);
    steps.forEach((s, i) => later(() => setLog((prev) => [...prev, s]), 260 + i * 360));
    const done = 260 + steps.length * 360 + 250;
    later(() => setPhase("granted"), done);
    later(() => setPhase("open"), done + 1500);
  }, [phase, dossier, activeViewer, restored, later]);

  useEffect(() => {
    if (phase === "code") codeRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const acceptTerms = (e) => {
    e.preventDefault();
    if (!canAccept) return;
    setError("");
    setPhase("code");
  };

  const startLockout = () => {
    setLockout(LOCKOUT_S);
    for (let i = 1; i <= LOCKOUT_S; i++) later(() => setLockout(LOCKOUT_S - i), i * 1000, true);
  };

  const deny = (left) => {
    setRadarMode("denied");
    later(() => setRadarMode("scan"), 900, true);
    setLog([]);
    setPhase("code");
    if (formScope.current && !reduce) animateForm(formScope.current, { x: [0, -12, 10, -6, 4, 0] }, { duration: 0.45 });
    if (left <= 0) {
      setAttempts(MAX_ATTEMPTS);
      setError(`Access denied. Too many attempts: locked for ${LOCKOUT_S} seconds.`);
      startLockout();
    } else {
      setAttempts(left);
      setError(`Access denied. ${left} attempt${left === 1 ? "" : "s"} left.`);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (phase !== "code" || lockout || !code) return;
    const value = code;
    const left = attempts - 1;
    setCode("");
    setError("");
    setLog(["verifying access code"]);
    setPhase("verifying");

    if (demoCode !== undefined) {
      // Preview builds only: no server, so the demo code is checked here.
      later(() => {
        if (value === demoCode) setDemoViewer({ name: name.trim(), org: org.trim(), expires: Date.now() + 8 * 3600 * 1000 });
        else deny(left);
      }, 800);
      return;
    }

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: value, agreed: true, terms: TERMS_VERSION, name, org }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 401) return deny(left);
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Terminal unavailable.");
    } catch {
      setError("Network unreachable. Try again.");
    }
    setLog([]);
    setPhase("code");
  };

  const lock = async () => {
    if (demoCode === undefined) await fetch("/api/vault", { method: "DELETE" }).catch(() => {});
    clearTimers();
    grantStarted.current = false;
    setDemoViewer(null);
    setRestored(false);
    setAgreed(false);
    setLog([]);
    setRadarMode("scan");
    setPhase("terms");
    if (demoCode === undefined) router.refresh();
  };

  const step = stepOf(phase);
  const signedAt = new Date().toISOString().slice(0, 10);

  return (
    <div className="vt-screen vx-noprint fixed inset-0 z-[100] flex flex-col overflow-hidden">
      <p className="vx-strip">Restricted · Proprietary · Not for distribution</p>
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a] sm:px-6">
        <span className="truncate">
          SWORT Aerospace<span className="hidden sm:inline"> · Restricted terminal</span>
        </span>
        <span className="flex shrink-0 items-center gap-4">
          <ZuluClock />
          <button type="button" onClick={() => router.push("/")} className="-my-2 py-2 uppercase tracking-[0.2em] hover:text-white">
            Exit
          </button>
        </span>
      </header>

      <AnimatePresence mode="wait">
        {phase !== "open" ? (
          <motion.main
            key="gate"
            className="relative flex-1 overflow-y-auto overscroll-contain"
            exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mx-auto grid min-h-full max-w-6xl content-start gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:content-center lg:gap-14 lg:py-10">
              <motion.div
                className={`mx-auto w-full transition-[max-width] duration-500 lg:max-w-[460px] ${phase === "terms" ? "max-w-[150px] sm:max-w-[200px]" : "max-w-[230px] sm:max-w-[300px]"}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <Radar mode={radarMode} />
                <p className="mt-2 hidden text-center text-[10px] uppercase tracking-[0.2em] text-[#5f5f5f] sm:block">
                  Tap the scope to ping
                </p>
              </motion.div>

              <div className="min-w-0">
                <ol className="mb-6 flex gap-5 border-b border-white/10 text-[10px] uppercase tracking-[0.2em]" aria-label="Progress">
                  {STEPS.map((label, i) => (
                    <li
                      key={label}
                      className={`relative pb-3 transition-colors ${i <= step ? "text-white" : "text-[#5f5f5f]"}`}
                      aria-current={i === step ? "step" : undefined}
                    >
                      <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className={i === step ? "ml-2" : "ml-2 hidden md:inline"}>{label}</span>
                      {i === step && <motion.span layoutId="vx-step" className="absolute inset-x-0 -bottom-px h-px bg-white" />}
                    </li>
                  ))}
                </ol>

                <AnimatePresence mode="wait">
                  {phase === "boot" && (
                    <motion.div key="boot" {...panel} onClick={skipBoot} className="cursor-pointer">
                      <div className="text-[12px] leading-[2]">
                        {BOOT.slice(0, bootCount).map(([text, kind]) => (
                          <p key={text} className="whitespace-pre-wrap break-words">
                            {kind === "ok" && <>[<span className="vt-ok">  OK  </span>] </>}
                            <span className={kind === "dim" ? "vt-dim" : kind === "warn" ? "text-white" : kind === "head" ? "text-white" : ""}>{text}</span>
                          </p>
                        ))}
                        <span className="vt-caret" aria-hidden="true" />
                      </div>
                      <button type="button" onClick={skipBoot} className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#7c7c7c] hover:text-white">
                        Skip
                      </button>
                    </motion.div>
                  )}

                  {phase === "terms" && (
                    <motion.form key="terms" {...panel} onSubmit={acceptTerms} noValidate>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">
                        {terms.title} · v{TERMS_VERSION}
                      </p>
                      <h1 className="mt-3 font-[family-name:var(--sw-font-display)] text-[clamp(40px,7vw,72px)] leading-[0.95] tracking-[0.02em] text-white">
                        Terms of access
                      </h1>
                      <p className="mt-3 max-w-[60ch] text-[13px] leading-relaxed text-[#a9a9a9]">{terms.intro}</p>

                      <ol className="mt-5 divide-y divide-white/10 border-y border-white/10 lg:max-h-[300px] lg:overflow-y-auto lg:pr-3">
                        {terms.clauses.map((clause, i) => (
                          <li key={clause.head} className="grid grid-cols-[32px_1fr] gap-2 py-3 text-[12.5px] leading-relaxed">
                            <span className="tabular-nums text-[#5f5f5f]">{String(i + 1).padStart(2, "0")}</span>
                            <span>
                              <span className="text-white">{clause.head}.</span> <span className="text-[#a9a9a9]">{clause.text}</span>
                            </span>
                          </li>
                        ))}
                      </ol>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                          Full name (signature)
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={80}
                            autoComplete="name"
                            required
                            className={fieldClass}
                            placeholder="Jane Doe"
                          />
                        </label>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                          Organization <span className="normal-case tracking-normal text-[#5f5f5f]">(optional)</span>
                          <input
                            value={org}
                            onChange={(e) => setOrg(e.target.value)}
                            maxLength={120}
                            autoComplete="organization"
                            className={fieldClass}
                            placeholder="Company or agency"
                          />
                        </label>
                      </div>

                      <label className="mt-6 flex cursor-pointer items-start gap-3 text-[12.5px] leading-relaxed text-[#c9c9c9]">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-white"
                        />
                        <span>
                          I have read and accept these terms. I will not share any detail from this terminal unless Andres Peña approves it in writing.
                        </span>
                      </label>

                      <AnimatePresence>
                        {canAccept && (
                          <motion.div
                            className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-white/20 pt-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <span className="font-[family-name:var(--sw-font-display)] text-[28px] leading-none tracking-[0.04em] text-white">{name.trim()}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                              Signed {signedAt} · v{TERMS_VERSION}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        disabled={!canAccept}
                        whileTap={canAccept ? { scale: 0.97 } : undefined}
                        className="mt-6 w-full border border-white bg-white px-6 py-3.5 text-[11px] uppercase tracking-[0.16em] text-black transition-colors hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-[#5f5f5f] sm:w-auto"
                      >
                        Accept and continue
                      </motion.button>
                    </motion.form>
                  )}

                  {(phase === "code" || phase === "verifying" || phase === "granted") && (
                    <motion.div key="auth" {...panel}>
                      {!restored && (
                        <form ref={formScope} onSubmit={submit}>
                          <p className="text-[10px] uppercase tracking-[0.24em] text-[#8a8a8a]">Step 03 · Authenticate</p>
                          <h1 className="mt-3 font-[family-name:var(--sw-font-display)] text-[clamp(40px,7vw,72px)] leading-[0.95] tracking-[0.02em] text-white">
                            Enter access code
                          </h1>
                          <p className="mt-3 text-[12.5px] leading-relaxed text-[#a9a9a9]">
                            Signed by <span className="text-white">{name.trim()}</span>
                            {org.trim() && <>, {org.trim()}</>} under terms v{TERMS_VERSION}.{" "}
                            {phase === "code" && (
                              <button type="button" onClick={() => setPhase("terms")} className="underline decoration-white/30 underline-offset-4 hover:text-white">
                                Review terms
                              </button>
                            )}
                          </p>

                          <label className={`mt-7 text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a] ${phase === "granted" ? "hidden" : "block"}`}>
                            Access code
                            <input
                              ref={codeRef}
                              type="password"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              disabled={phase !== "code" || lockout > 0}
                              autoComplete="current-password"
                              autoCapitalize="off"
                              autoCorrect="off"
                              spellCheck={false}
                              enterKeyHint="go"
                              className={`${fieldClass} text-[22px] tracking-[0.4em] disabled:opacity-50`}
                            />
                          </label>

                          <div className={`mt-3 flex-wrap justify-between gap-2 text-[10px] uppercase tracking-[0.2em] ${phase === "granted" ? "hidden" : "flex"}`}>
                            <span className="text-[#7c7c7c]">
                              Attempts <span className="tabular-nums text-white">{attempts}/{MAX_ATTEMPTS}</span>
                            </span>
                            {lockout > 0 && <span className="vt-fail tabular-nums">Locked · {lockout}s</span>}
                          </div>

                          <AnimatePresence>
                            {error && (
                              <motion.p
                                key={error}
                                role="alert"
                                className="vt-fail mt-4 text-[12.5px]"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                              >
                                {error}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          {phase === "code" && (
                            <motion.button
                              type="submit"
                              disabled={!code || lockout > 0}
                              whileTap={code ? { scale: 0.97 } : undefined}
                              className="mt-6 w-full border border-white bg-white px-6 py-3.5 text-[11px] uppercase tracking-[0.16em] text-black transition-colors hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-[#5f5f5f] sm:w-auto"
                            >
                              Authenticate
                            </motion.button>
                          )}
                          {phase === "code" && (
                            <p className="mt-5 text-[11px] text-[#6f6f6f]">
                              No code? Request one at{" "}
                              <a href="mailto:andrfp@swort.net" className="underline decoration-white/30 underline-offset-4 hover:text-white">
                                andrfp@swort.net
                              </a>
                              .
                            </p>
                          )}
                        </form>
                      )}

                      {log.length > 0 && (
                        <div className="mt-6 text-[12px] leading-[2]" aria-live="polite">
                          {log.map((entry, i) => (
                            <motion.p key={entry} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="break-words">
                              [<span className={i === 0 && phase === "verifying" && log.length === 1 ? "vt-dim" : "vt-ok"}>{i === 0 && phase === "verifying" && log.length === 1 ? " .... " : "  OK  "}</span>] {entry}
                            </motion.p>
                          ))}
                          {phase === "verifying" && (
                            <div className="relative mt-3 h-px w-full max-w-sm overflow-hidden bg-white/10">
                              <motion.span
                                className="absolute inset-y-0 left-0 w-1/3 bg-white"
                                animate={reduce ? {} : { x: ["-100%", "300%"] }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {phase === "granted" && (
                        <motion.p
                          className="mt-6 font-[family-name:var(--sw-font-display)] text-[clamp(44px,9vw,96px)] leading-none tracking-[0.04em] text-white"
                          initial={{ opacity: 0, letterSpacing: "0.4em", filter: "blur(8px)" }}
                          animate={reduce
                            ? { opacity: 1, letterSpacing: "0.04em", filter: "blur(0px)" }
                            : { opacity: [0, 1, 0.3, 1, 0.6, 1], letterSpacing: "0.04em", filter: "blur(0px)" }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        >
                          Access granted
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.main>
        ) : (
          <motion.div
            key="dossier"
            className="relative flex-1 overflow-y-auto overscroll-contain"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <Dossier content={dossier} viewer={activeViewer} onLock={lock} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "open" && <Watermark viewer={activeViewer} />}
      <p className="vx-strip">Restricted · Proprietary · Not for distribution</p>
    </div>
  );
}

const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

// The viewer's name and organization tiled faintly across the open file, so
// any screenshot carries who it was released to.
function Watermark({ viewer }) {
  const label = [viewer?.name, viewer?.org, new Date().toISOString().slice(0, 10), "Restricted"]
    .filter(Boolean)
    .join("  ·  ")
    .toUpperCase();
  const width = Math.max(420, label.length * 10 + 120);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='150'><text x='20' y='80' fill='white' fill-opacity='0.055' font-family='ui-monospace, monospace' font-size='13' letter-spacing='2'>${escapeXml(label)}</text></svg>`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div
        className="absolute -inset-1/2 -rotate-[24deg]"
        style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundSize: `${width}px 150px` }}
      />
    </div>
  );
}
