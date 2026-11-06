import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cjsDir = resolve(__dirname, "../dist/cjs");
const cjsPkgPath = resolve(cjsDir, "package.json");

mkdirSync(cjsDir, { recursive: true });
writeFileSync(cjsPkgPath, JSON.stringify({ type: "commonjs" }, null, 2) + "\n", "utf8");

// Rewrite "antd/es/" to "antd/lib/" in CommonJS output files so Node/Next.js SSR/Jest CJS environments
// never fail on ESM-only antd/es/* files.
function rewriteAntdEsToLib(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      rewriteAntdEsToLib(fullPath);
    } else if (fullPath.endsWith(".js")) {
      const content = readFileSync(fullPath, "utf8");
      if (content.includes("antd/es/")) {
        writeFileSync(fullPath, content.replaceAll("antd/es/", "antd/lib/"), "utf8");
      }
    }
  }
}

rewriteAntdEsToLib(cjsDir);
