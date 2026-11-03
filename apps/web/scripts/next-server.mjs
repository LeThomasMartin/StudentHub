import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { isIPv4 } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(webRoot, "../..");
const rootEnvFile = resolve(repositoryRoot, ".env");

if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

const host = process.env.STUDENTHUB_BIND_HOST || "127.0.0.1";
const hostOctets = host.split(".").map(Number);
const isTailscaleIPv4 =
  isIPv4(host) &&
  hostOctets[0] === 100 &&
  hostOctets[1] >= 64 &&
  hostOctets[1] <= 127 &&
  hostOctets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255);
if (host !== "127.0.0.1" && !isTailscaleIPv4) {
  console.error("STUDENTHUB_BIND_HOST must be 127.0.0.1 or an IPv4 address in Tailscale's 100.64.0.0/10 range.");
  process.exit(1);
}

const port = Number(process.env.STUDENTHUB_PORT || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error("STUDENTHUB_PORT must be an integer between 1024 and 65535.");
  process.exit(1);
}

const command = process.argv[2];
if (command !== "dev" && command !== "start") {
  console.error("Usage: node scripts/next-server.mjs <dev|start>");
  process.exit(1);
}

const nextCli = resolve(webRoot, "node_modules", "next", "dist", "bin", "next");
const server = spawn(
  process.execPath,
  [nextCli, command, "--hostname", host, "--port", String(port)],
  { cwd: webRoot, env: process.env, stdio: "inherit" },
);

server.on("error", (error) => {
  console.error("Unable to start the StudentHub web server:", error.name);
  process.exit(1);
});
server.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}
