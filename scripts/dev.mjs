import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";
const serveOnly = process.argv.includes("--serve-only");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

function resolveFilePath(urlPath) {
  const sanitizedPath = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const requestPath = sanitizedPath === "/" ? "/index.html" : sanitizedPath;
  const absolutePath = resolve(rootDir, `.${requestPath}`);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }

  if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
    return join(absolutePath, "index.html");
  }

  return absolutePath;
}

function startServer() {
  const server = createServer((request, response) => {
    const filePath = resolveFilePath(request.url ?? "/");

    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    try {
      const content = readFileSync(filePath);
      response.writeHead(200, {
        "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
      });
      response.end(content);
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Server error");
    }
  });

  server.listen(port, host, () => {
    console.log(`Static server: http://${host}:${port}`);
    console.log(`Dot product demo: http://${host}:${port}/dot-product/`);
  });

  return server;
}

function startWatcher() {
  const tscBin = resolve(rootDir, "node_modules/typescript/bin/tsc");

  if (!existsSync(tscBin)) {
    console.error("TypeScript is not installed. Run `npm install` first.");
    process.exitCode = 1;
    return null;
  }

  return spawn(process.execPath, [tscBin, "--watch", "--preserveWatchOutput"], {
    cwd: rootDir,
    stdio: "inherit",
  });
}

const server = startServer();
const watcher = serveOnly ? null : startWatcher();

function shutdown(signal) {
  if (watcher) {
    watcher.kill(signal);
  }

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
