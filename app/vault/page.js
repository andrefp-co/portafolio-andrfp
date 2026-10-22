import { cookies } from "next/headers";
import VaultTerminal from "../components/vault/vault-terminal";
import { vault } from "@/utils/data/vault";
import { VAULT_COOKIE, verifySession } from "@/utils/vault";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vault",
  robots: { index: false, follow: false },
};

// The session is checked here, on the server, and vault content is only
// passed down when it is valid. Without a session the client receives the
// terminal and nothing else.
export default async function VaultPage() {
  const store = await cookies();
  const authorized = verifySession(store.get(VAULT_COOKIE)?.value);

  return <VaultTerminal authorized={authorized} content={authorized ? vault : null} />;
}
