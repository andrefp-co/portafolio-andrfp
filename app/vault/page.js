import { cookies } from "next/headers";
import VaultTerminal from "../components/vault/vault-terminal";
import { vault } from "@/utils/data/vault";
import { VAULT_COOKIE, verifySession } from "@/utils/vault";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Restricted",
  robots: { index: false, follow: false },
  alternates: { canonical: "/vault" },
};

// The session is checked here, on the server, and vault content is only
// passed down when it is valid. Without a session the client receives the
// terminal and the public terms, nothing else.
export default async function VaultPage({ searchParams }) {
  const store = await cookies();
  const next = (await searchParams)?.next === "resume" ? "resume" : null;
  const session = verifySession(store.get(VAULT_COOKIE)?.value);

  return (
    <VaultTerminal
      next={next}
      authorized={Boolean(session)}
      viewer={session ? { name: session.name, org: session.org, expires: session.expires } : null}
      content={session ? vault : null}
    />
  );
}
