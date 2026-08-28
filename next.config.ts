import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["reactflow-edge-routing"],
};

export default nextConfig;
