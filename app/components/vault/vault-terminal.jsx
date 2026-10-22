"use client";

import { personalData } from "@/utils/data/personal-data";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Dossier from "./dossier";

// The vault's front door: a Linux-style boot, a small working shell, and a
// no-echo password prompt. The code is checked by /api/vault on the server;
// this component never sees vault content until the server sends it.

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
  "  unlock      enter an access code",
  "  ls          list files",
  "  cat FILE    print a file",
  "  whoami      print the current user",
  "  uname -a    print system information",
  "  clear       clear the screen",
  "  exit        leave the vault",
];

const QUICK = ["unlock", "help", "ls", "cat readme.txt", "exit"];

let lineId = 0;
const line = (text, kind = "plain") => ({ id: ++lineId, text, kind });

const now = () =>
  new Date().toLocaleString("en-US", {
    weekday: "short", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).replace(/,/g, "");

export default function VaultTerminal({ authorized = false, content = null, demoCode, demoContent }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [lines, setLines] = useState([]);
  const [phase, setPhase] = useState("boot"); // boot | shell | password | checking | granting | open
  const [value, setValue] = useState("");
  const [failures, setFailures] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [progress, setProgress] = useState(null);
  const history = useRef([]);
  const historyIndex = useRef(-1);
  const inputRef = useRef(null);
  const screenRef = useRef(null);
  const timers = useRef([]);
  const grantStarted = useRef(false);

  const isAuthorized = authorized || demoUnlocked;
  const dossier = content || (demoUnlocked ? demoContent : null);

  const later = useCallback((fn, ms) => {
    timers.current.push(setTimeout(fn, reduce ? 0 : ms));
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
          line("Type 'unlock' to enter yours, or 'help' for commands.", "dim"),
          line("")
        );
        setPhase("shell");
      }
    }, t + (fast ? 120 : 380));
    // Plays once; the props it reads are fixed for the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once the server confirms access (the refreshed page now carries content),
  // run the decrypt sequence and open the dossier.
  useEffect(() => {
    if (!isAuthorized || !dossier || phase !== "checking" || grantStarted.current) return;
    grantStarted.current = true;
    later(() => {
      setPhase("granting");
      print(line(`Last login: ${now()} on tty1`, "dim"), line("guest@vault:~$ ./decrypt --dossier pena_andres"), line("[decrypt] key accepted", "ok-plain"));
      const steps = 24;
      for (let i = 0; i <= steps; i++) later(() => setProgress(i / steps), 300 + i * 45);
      later(() => setPhase("open"), 300 + steps * 45 + 1300);
    }, 0);
  }, [isAuthorized, dossier, phase, later, print]);

  // Keep the newest line in view.
  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, phase, progress]);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  useEffect(() => {
    if (phase === "shell" || phase === "password") focusInput();
  }, [phase]);

  const prompt = phase === "password" ? "Password: " : "guest@vault:~$ ";

  const runCommand = async (raw) => {
    const cmd = raw.trim();
    print(line(`guest@vault:~$ ${raw}`));
    if (cmd) {
      history.current = [cmd, ...history.current].slice(0, 30);
      historyIndex.current = -1;
    }
    const [name, ...args] = cmd.split(/\s+/);

    switch (name) {
      case "":
        return;
      case "help":
        return print(...HELP.map((h) => line(h)));
      case "ls":
        return print(line("dossier.enc  readme.txt"));
      case "cat":
        if (args[0] === "readme.txt") {
          return print(
            line("This is Andres Peña's restricted portfolio."),
            line(`Access codes are issued personally. Ask for one: ${personalData.email}`)
          );
        }
        if (args[0] === "dossier.enc") return print(line("cat: dossier.enc: file is encrypted (run 'unlock')", "fail"));
        return print(line(`cat: ${args[0] ?? ""}: No such file or directory`, "fail"));
      case "whoami":
        return print(line("guest"));
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
        if (cooldown) return print(line("vault: too many failures; wait a moment and try again", "fail"));
        return setPhase("password");
      default:
        return print(line(`bash: ${name}: command not found`, "fail"));
    }
  };

  const submitPassword = async (code) => {
    print(line("Password: "));
    setPhase("checking");

    if (demoCode !== undefined) {
      // Preview builds only: no server, so the demo code is checked here.
      later(() => {
        if (code === demoCode) setDemoUnlocked(true);
        else failLogin();
      }, 700);
      return;
    }

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 401) return failLogin();
      const data = await res.json().catch(() => ({}));
      print(line(data.message || "vault: unavailable", "fail"), line(""));
      setPhase("shell");
    } catch {
      print(line("vault: network unreachable", "fail"), line(""));
      setPhase("shell");
    }
  };

  const failLogin = () => {
    const count = failures + 1;
    setFailures(count);
    print(line(""), line("Login incorrect", "fail"));
    if (count >= 3) {
      print(line("vault: maximum number of tries exceeded (3); locked for 10 seconds", "fail"), line(""));
      setCooldown(true);
      setFailures(0);
      later(() => setCooldown(false), 10000);
    } else {
      print(line(""));
    }
    setPhase("shell");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const current = value;
      setValue("");
      if (phase === "password") submitPassword(current);
      else if (phase === "shell") runCommand(current);
      return;
    }
    if (e.key === "Escape" && phase === "password") {
      setValue("");
      print(line("Password: ^C"), line(""));
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
    setDemoUnlocked(false);
    grantStarted.current = false;
    setProgress(null);
    setLines([line("vault locked.", "dim"), line("")]);
    setPhase("shell");
    if (demoCode === undefined) router.refresh();
  };

  const acceptingInput = phase === "shell" || phase === "password";
  const bar = progress === null ? null : `${"█".repeat(Math.round(progress * 28))}${"░".repeat(28 - Math.round(progress * 28))}`;

  return (
    <div className="vt-screen fixed inset-0 z-[100] flex flex-col">
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#7c7c7c] sm:px-6">
        <span>SWORT/OS 1.0 · tty1</span>
        <button type="button" onClick={() => router.push("/")} className="uppercase tracking-[0.2em] hover:text-white">
          Exit to site
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase !== "open" ? (
          <motion.div
            key="terminal"
            ref={screenRef}
            className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6"
            onClick={focusInput}
            exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mx-auto max-w-4xl">
              {lines.map((l) => {
                if (l.kind === "banner") {
                  return (
                    <pre key={l.id} className="vt-banner my-4 overflow-x-auto text-[9px] leading-[1.05] text-white sm:text-[12px]" aria-label="Vault">
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
                const cls = l.kind === "fail" ? "vt-fail" : l.kind === "dim" ? "vt-dim" : l.kind === "ok-plain" ? "vt-ok" : "";
                return (
                  <p key={l.id} className={`whitespace-pre-wrap break-words ${cls}`}>
                    {l.text || " "}
                  </p>
                );
              })}

              {bar && (
                <p className="whitespace-pre tabular-nums">
                  [decrypt] {bar} {Math.round(progress * 100)}%
                </p>
              )}

              {phase === "granting" && progress === 1 && (
                <motion.p
                  className="mt-6 font-[family-name:var(--sw-font-display)] text-[clamp(44px,9vw,96px)] leading-none tracking-[0.04em] text-white"
                  initial={{ opacity: 0, letterSpacing: "0.4em", filter: "blur(8px)" }}
                  animate={reduce
                    ? { opacity: 1, letterSpacing: "0.04em", filter: "blur(0px)" }
                    : { opacity: [0, 1, 0.3, 1, 0.6, 1], letterSpacing: "0.04em", filter: "blur(0px)" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                >
                  ACCESS GRANTED
                </motion.p>
              )}

              {acceptingInput && (
                <div className="relative flex flex-wrap items-baseline">
                  <span className="whitespace-pre">{prompt}</span>
                  {/* Shell input echoes; the password prompt, like Linux, shows nothing. */}
                  <span className="whitespace-pre-wrap break-all">{phase === "password" ? "" : value}</span>
                  <span className="vt-caret" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    type={phase === "password" ? "password" : "text"}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint={phase === "password" ? "go" : "send"}
                    aria-label={phase === "password" ? "Access code" : "Terminal command"}
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  />
                </div>
              )}

              {phase === "shell" && (
                <div className="mt-8 flex flex-wrap gap-2" aria-label="Quick commands">
                  {QUICK.map((cmd) => (
                    <motion.button
                      key={cmd}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => { e.stopPropagation(); runCommand(cmd); }}
                      className="border border-white/20 px-3 py-2 text-[11px] text-[#bdbdbd] hover:border-white hover:text-white"
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
            className="relative flex-1 overflow-y-auto"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <Dossier content={dossier} onLock={lock} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
