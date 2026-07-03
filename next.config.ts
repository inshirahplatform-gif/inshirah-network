import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler conflicts with Turbopack on Windows — disabled
};

export default nextConfig;
