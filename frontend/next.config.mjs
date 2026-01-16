/** @type {import('next').NextConfig} */
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const useTurbopack = process.env.NEXT_USE_TURBOPACK === "1";

const nextConfig = useTurbopack
  ? {
      // Keep config minimal; avoids TS config compilation edge cases.
      turbopack: {
        root: __dirname,
      },
    }
  : {};

export default nextConfig;
