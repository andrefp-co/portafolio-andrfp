// True only in the static preview build (NEXT_PUBLIC_PREVIEW=1). That build
// runs inside a sandboxed viewer with no server behind it, where forms have
// nowhere to post, PDFs and downloads are blocked and mail links do nothing,
// so those actions show a short notice instead of failing silently.
export const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";
