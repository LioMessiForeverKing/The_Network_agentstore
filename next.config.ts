import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config - mobile/ and supabase/functions/ are excluded via tsconfig.json
  // These are Deno edge functions, not Next.js code
  turbopack: {},
};

export default nextConfig;
