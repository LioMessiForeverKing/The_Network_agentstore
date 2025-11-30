import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude mobile and supabase functions directories from compilation
  // These are Deno edge functions, not Next.js code
  webpack: (config) => {
    // Ignore these directories in webpack watch
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored) 
          ? config.watchOptions.ignored 
          : [config.watchOptions?.ignored].filter(Boolean)),
        '**/mobile/**',
        '**/supabase/functions/**'
      ]
    };
    
    return config;
  },
};

export default nextConfig;
