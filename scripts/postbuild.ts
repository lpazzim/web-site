// Moves the pre-rendered not-found page to /404.html, which Vercel serves with
// a real 404 status for any path that has no file and no rewrite.
import { rename, rm } from "node:fs/promises";

const client = new URL("../build/client/", import.meta.url);

await rename(new URL("404/index.html", client), new URL("404.html", client));
await rm(new URL("404", client), { recursive: true, force: true });
console.log("postbuild: wrote build/client/404.html");
