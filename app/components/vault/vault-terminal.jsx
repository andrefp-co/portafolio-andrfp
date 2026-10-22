"use client";

import { TERMS_VERSION, terms } from "@/utils/data/vault-terms";
import { decodeEmail } from "@/utils/obfuscate";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Dossier from "./dossier";
import Radar from "./radar";

// The vault's front door: a Linux-style boot and a small working shell.
// `unlock` prints the terms of access, takes a typed signature and a "yes",
// then a no-echo password. The code and the signed terms are checked by
// /api/vault on the server; this component never sees vault content until
// the server sends it. Once access is granted, a radar scope locks on before
// the file opens.

const EASE = [0.22, 1, 0.36, 1];

const BANNER = [
  "██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗",
  "██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝",
  "██║   ██║███████║██║   ██║██║     ██║   ",
  "╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ",
  " ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ",
  "  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ",
].join("\n");

const BOOT = [
  { kind: "dim", text: "[    0.000000] Linux version 6.12.0-swort (andres@bench) (gcc 14.2.0) #1 SMP PREEMPT_DYNAMIC" },
  { kind: "dim", text: "[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.12.0-swort root=/dev/mapper/vault ro quiet" },
  { kind: "dim", text: "[    0.104221] smpboot: CPU0: bench avionics core, 4 threads" },
  { kind: "dim", text: "[    0.318842] imu0: accel/gyro online @ 400 Hz" },
  { kind: "dim", text: "[    0.319107] gnss0: receiver online, raw stream enabled" },
  { kind: "dim", text: "[    0.402551] baro0: pressure sensor online" },
  { kind: "dim", text: "[    0.611245] csia: trust graph loaded (8 nodes, 11 edges)" },
  { kind: "ok", text: "Started Journal Service." },
  { kind: "ok", text: "Found device /dev/mapper/vault (encrypted)." },
  { kind: "ok", text: "Reached target Telemetry Link." },
  { kind: "ok", text: "Started Cross-Sensor Integrity Monitor." },
  { kind: "ok", text: "Started Getty on tty1." },
  { kind: "ok", text: "Reached target Multi-User System." },
];

const HELP = [
  "  unlock          read and sign the terms, then enter an access code",
  "  cat terms.txt   print the terms of access",
  "  ls              list files",
  "  cat FILE        print a file",
  "  whoami          print the current user",
  "  uname -a        print system information",
  "  clear           clear the screen",
  "  exit            leave the vault",
];

const QUICK = {
  shell: ["unlock", "help", "ls", "cat terms.txt", "exit"],
  org: ["skip"],
  agree: ["yes", "no"],
};

const PROMPTS = {
  shell: "guest@vault:~$ ",
  name: "Full name (signature): ",
  org: "Organization (optional): ",
  agree: "Type 'yes' to accept these terms: ",
  password: "Password: ",
};

let lineId = 0;
const line = (text, kind = "plain") => ({ id: ++lineId, text, kind });

const now = () =>
  new Date()
    .toLocaleString("en-US", { weekday: "short", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    .replace(/,/g, "");

const termsLines = () => [
  line(""),
  line(`${terms.title.toUpperCase()}  ·  v${TERMS_VERSION}`, "head"),
  line(terms.intro, "dim"),
  line(""),
  ...terms.clauses.map((c, i) => line(`${String(i + 1).padStart(2, "0")}  ${c.head}. ${c.text}`, "clause")),
  line(""),
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

export default function VaultTerminal({ authorized = false, viewer = null, content = null, demoCode, demoContent, next = null }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [lines, setLines] = useState([]);
  // boot | shell | name | org | agree | password | checking | granting | open
  const [phase, setPhase] = useState("boot");
  const [value, setValue] = useState("");
  const [failures, setFailures] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [name, setName] = useState(viewer?.name ?? "");
  const [org, setOrg] = useState(viewer?.org ?? "");
  const [agreed, setAgreed] = useState(Boolean(viewer));
  const [demoViewer, setDemoViewer] = useState(null);
  const [grantLog, setGrantLog] = useState([]);
  const [radarMode, setRadarMode] = useState("scan");
  const [progress, setProgress] = useState(0);
  const [granted, setGranted] = useState(false);
  const history = useRef([]);
  const historyIndex = useRef(-1);
  const inputRef = useRef(null);
  const screenRef = useRef(null);
  const timers = useRef([]);
  const grantStarted = useRef(false);
  const submitted = useRef(false);

  const activeViewer = viewer || demoViewer;
  const isAuthorized = authorized || Boolean(demoViewer);
  const dossier = content || (demoViewer ? demoContent : null);

  const later = useCallback((fn, ms, always = false) => {
    timers.current.push(setTimeout(fn, reduce && !always ? 0 : ms));
  }, [reduce]);

  const print = useCallback((...items) => setLines((prev) => [...prev, ...items]), []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Boot sequence, played once on arrival.
  useEffect(() => {
    let t = 0;
    const fast = authorized;
    BOOT.forEach((entry) => {
      t += fast ? 18 : 40 + Math.random() * 90;
      later(() => print(line(entry.text, entry.kind)), t);
    });
    later(() => {
      print(line(BANNER, "banner"), line("SWORT/OS 1.0 vault tty1", "dim"), line(""));
      if (authorized) {
        print(line("Session restored.", "ok-plain"));
        setPhase("checking");
      } else {
        print(
          line("Restricted portfolio. Access codes are issued personally."),
          ...(next === "resume" ? [line("Requested file: résumé. It opens once you unlock with your access code.", "head")] : []),
          line("Type 'unlock' to read and sign the terms and enter your code, or 'help' for commands.", "dim"),
          line("")
        );
        setPhase("shell");
      }
    }, t + (fast ? 120 : 380));
    // Plays once; the props it reads are fixed for the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once the server has sent the dossier: the radar locks on, the session
  // details print, ACCESS GRANTED, and the file opens.
  useEffect(() => {
    if (!isAuthorized || !dossier || phase !== "checking" || grantStarted.current) return;
    grantStarted.current = true;
    const who = activeViewer?.name ? `${activeViewer.name}${activeViewer.org ? `, ${activeViewer.org}` : ""}` : "viewer";
    const steps = [
      ["Access code", submitted.current ? "Accepted" : "Session restored"],
      ["Terms", `v${TERMS_VERSION}, signed by ${who}`],
      ["Session", "Signed, ends in 8 hours"],
      ["File", "Decrypted"],
    ];
    later(() => {
      setGrantLog([]);
      setProgress(0);
      setGranted(false);
      setRadarMode("scan");
      setPhase("granting");
    }, 0);
    later(() => setRadarMode("lock"), 1000);
    steps.forEach((step, i) => later(() => setGrantLog((prev) => [...prev, step]), 650 + i * 420));
    const start = 650 + steps.length * 420;
    for (let i = 1; i <= 20; i++) later(() => setProgress(i / 20), start + i * 50);
    later(() => setGranted(true), start + 20 * 50 + 250);
    later(() => setPhase("open"), start + 20 * 50 + 1900);
  }, [isAuthorized, dossier, phase, activeViewer, later]);

  // Keep the newest line in view.
  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, phase]);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  const typing = ["shell", "name", "org", "agree", "password"].includes(phase);
  useEffect(() => {
    if (typing) focusInput();
  }, [typing, phase]);

  const prompt = PROMPTS[phase] ?? "";

  const startUnlock = () => {
    if (cooldown) return print(line("vault: too many failures; wait a moment and try again", "fail"), line(""));
    if (agreed && name) {
      print(line(`terms v${TERMS_VERSION} signed by ${name}${org ? `, ${org}` : ""}`, "dim"));
      return setPhase("password");
    }
    print(...termsLines());
    setPhase("name");
  };

  const runCommand = (raw) => {
    const cmd = raw.trim();
    print(line(`${PROMPTS.shell}${raw}`));
    if (cmd) {
      history.current = [cmd, ...history.current].slice(0, 30);
      historyIndex.current = -1;
    }
    const [cmdName, ...args] = cmd.split(/\s+/);

    switch (cmdName) {
      case "":
        return;
      case "help":
        return print(...HELP.map((h) => line(h)));
      case "ls":
        return print(line("dossier.enc  readme.txt  terms.txt"));
      case "cat":
        if (args[0] === "readme.txt") {
          return print(
            line("This is Andres Peña's restricted portfolio."),
            line(`Access codes are issued personally. Ask for one: ${decodeEmail()}`)
          );
        }
        if (args[0] === "terms.txt") return print(...termsLines());
        if (args[0] === "dossier.enc") return print(line("cat: dossier.enc: file is encrypted (run 'unlock')", "fail"));
        return print(line(`cat: ${args[0] ?? ""}: No such file or directory`, "fail"));
      case "whoami":
        return print(line(agreed && name ? name : "guest"));
      case "uname":
        return print(line(args[0] === "-a" ? "Linux vault 6.12.0-swort #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "Linux"));
      case "clear":
        return setLines([]);
      case "sudo":
        return print(line("guest is not in the sudoers file.  This incident will be reported.", "fail"));
      case "rm":
        return print(line("rm: cannot remove: Read-only file system", "fail"));
      case "exit":
      case "logout":
        print(line("logout", "dim"));
        return later(() => router.push("/"), 400);
      case "unlock":
      case "login":
        return startUnlock();
      default:
        return print(line(`bash: ${cmdName}: command not found`, "fail"));
    }
  };

  const submitName = (raw) => {
    const typed = raw.replace(/\s+/g, " ").trim().slice(0, 80);
    print(line(`${PROMPTS.name}${raw}`));
    if (typed.length < 2) return print(line("unlock: a signature (your full name) is required", "fail"));
    setName(typed);
    setPhase("org");
  };

  const submitOrg = (raw) => {
    const typed = raw.trim().toLowerCase() === "skip" ? "" : raw.replace(/\s+/g, " ").trim().slice(0, 120);
    print(line(`${PROMPTS.org}${typed}`));
    setOrg(typed);
    setPhase("agree");
  };

  const submitAgree = (raw) => {
    print(line(`${PROMPTS.agree}${raw}`));
    if (/^(y|yes|i agree|agree)$/i.test(raw.trim())) {
      setAgreed(true);
      print(line(`terms v${TERMS_VERSION} signed by ${name}${org ? `, ${org}` : ""}`, "ok"), line(""));
      return setPhase("password");
    }
    print(line("Terms declined. The vault stays closed.", "fail"), line(""));
    setPhase("shell");
  };

  const failLogin = () => {
    const count = failures + 1;
    setFailures(count);
    print(line(""), line("Login incorrect", "fail"));
    if (count >= 3) {
      print(line("vault: maximum number of tries exceeded (3); locked for 10 seconds", "fail"), line(""));
      setCooldown(true);
      setFailures(0);
      later(() => setCooldown(false), 10000, true);
    } else {
      print(line(""));
    }
    setPhase("shell");
  };

  const submitPassword = async (code) => {
    print(line(PROMPTS.password));
    setPhase("checking");
    submitted.current = true;

    if (demoCode !== undefined) {
      // Preview builds only: no server, so the demo code is checked here.
      later(() => {
        if (code === demoCode) setDemoViewer({ name, org, expires: Date.now() + 8 * 3600 * 1000 });
        else failLogin();
      }, 700);
      return;
    }

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, agreed: true, terms: TERMS_VERSION, name, org }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 401) return failLogin();
      const data = await res.json().catch(() => ({}));
      print(line(`vault: ${data.message || "unavailable"}`, "fail"), line(""));
    } catch {
      print(line("vault: network unreachable", "fail"), line(""));
    }
    setPhase("shell");
  };

  const submit = (raw) => {
    if (phase === "shell") return runCommand(raw);
    if (phase === "name") return submitName(raw);
    if (phase === "org") return submitOrg(raw);
    if (phase === "agree") return submitAgree(raw);
    if (phase === "password") return submitPassword(raw);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const current = value;
      setValue("");
      submit(current);
      return;
    }
    if ((e.key === "Escape" || (e.key === "c" && e.ctrlKey)) && phase !== "shell") {
      e.preventDefault();
      setValue("");
      print(line(`${prompt}^C`), line(""));
      setPhase("shell");
      return;
    }
    if (phase === "shell" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const next = historyIndex.current + (e.key === "ArrowUp" ? 1 : -1);
      if (next < -1 || next >= history.current.length) return;
      historyIndex.current = next;
      setValue(next === -1 ? "" : history.current[next]);
    }
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const lock = async () => {
    if (demoCode === undefined) await fetch("/api/vault", { method: "DELETE" }).catch(() => {});
    setDemoViewer(null);
    grantStarted.current = false;
    setGranted(false);
    setLines([line("vault locked.", "dim"), line("")]);
    setPhase("shell");
    if (demoCode === undefined) router.refresh();
  };

  const echo = phase === "password" ? "" : value;

  return (
    <div className="vt-screen vx-noprint fixed inset-0 z-[100] flex flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a] sm:px-6">
        <span className="truncate">SWORT/OS 1.0 · tty1</span>
        <span className="flex shrink-0 items-center gap-4">
          <ZuluClock />
          <button type="button" onClick={() => router.push("/")} className="-my-2 py-2 uppercase tracking-[0.2em] hover:text-white">
            Exit to site
          </button>
        </span>
      </header>

      <AnimatePresence mode="wait">
        {phase === "granting" ? (
          <motion.div
            key="grant"
            className="relative flex flex-1 items-center overflow-y-auto px-4 py-8 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">
              <motion.div
                className="mx-auto w-full max-w-[min(400px,60vw)] md:max-w-[400px]"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <Radar mode={radarMode} />
              </motion.div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a8a8a]">{granted ? "Access granted" : "Verifying"}</p>
                <dl className="mt-5 border-t border-white/10 text-[13px]" aria-live="polite">
                  {grantLog.map(([label, value]) => (
                    <motion.div
                      key={label}
                      className="grid grid-cols-[112px_1fr] gap-4 border-b border-white/10 py-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <dt className="text-[#8a8a8a]">{label}</dt>
                      <dd className="break-words text-white">{value}</dd>
                    </motion.div>
                  ))}
                </dl>
                <div className="mt-6 h-px w-full bg-white/10">
                  <div className="h-px origin-left bg-white transition-transform duration-75" style={{ transform: `scaleX(${progress})` }} />
                </div>
                {granted && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                    <p className="mt-8 font-[family-name:var(--sw-font-display)] text-[clamp(40px,6vw,68px)] leading-none tracking-[0.02em] text-white">Peña, Andres</p>
                    <p className="mt-2 text-[12px] text-[#8a8a8a]">Opening the file…</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : phase !== "open" ? (
          <motion.div
            key="terminal"
            ref={screenRef}
            className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
            onClick={focusInput}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <div className="mx-auto max-w-4xl">
              {lines.map((l) => {
                if (l.kind === "banner") {
                  return (
                    <pre key={l.id} className="vt-banner my-4 overflow-x-auto text-[8px] leading-[1.05] text-white min-[380px]:text-[9px] sm:text-[12px]" aria-label="Vault">
                      {l.text}
                    </pre>
                  );
                }
                if (l.kind === "ok") {
                  return (
                    <p key={l.id} className="whitespace-pre-wrap break-words">
                      [<span className="vt-ok">  OK  </span>] {l.text}
                    </p>
                  );
                }
                const cls =
                  l.kind === "fail"
                    ? "vt-fail"
                    : l.kind === "dim"
                      ? "vt-dim"
                      : l.kind === "ok-plain"
                        ? "vt-ok"
                        : l.kind === "head"
                          ? "text-white"
                          : l.kind === "clause"
                            ? "pl-[6ch] -indent-[4ch] text-[#c9c9c9]"
                            : "";
                return (
                  <p key={l.id} className={`whitespace-pre-wrap break-words ${cls}`}>
                    {l.text || " "}
                  </p>
                );
              })}

              {typing && (
                <div className="relative flex flex-wrap items-baseline">
                  <span className="whitespace-pre">{prompt}</span>
                  {/* The password prompt, like Linux, shows nothing as you type. */}
                  <span className="whitespace-pre-wrap break-all">{echo}</span>
                  <span className="vt-caret" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    type={phase === "password" ? "password" : "text"}
                    autoComplete={phase === "name" ? "name" : phase === "org" ? "organization" : phase === "password" ? "current-password" : "off"}
                    autoCapitalize={phase === "name" || phase === "org" ? "words" : "off"}
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint={phase === "password" ? "go" : "send"}
                    aria-label={phase === "password" ? "Access code" : prompt.replace(/[:$ ]+$/, "") || "Terminal command"}
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  />
                </div>
              )}

              {phase === "checking" && <span className="vt-caret mt-1" aria-hidden="true" />}

              {QUICK[phase] && (
                <div className="mt-8 flex flex-wrap gap-2" aria-label="Quick commands">
                  {QUICK[phase].map((cmd) => (
                    <motion.button
                      key={cmd}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue("");
                        submit(cmd);
                      }}
                      className="min-h-[40px] border border-white/20 px-3 py-2 text-[11px] text-[#bdbdbd] hover:border-white hover:text-white"
                    >
                      {cmd}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dossier"
            className="relative flex-1 overflow-y-auto overscroll-contain"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <Dossier content={dossier} viewer={activeViewer} onLock={lock} termsVersion={TERMS_VERSION} focus={next} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
