import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Stay, owner, guide and experience photos live in Supabase Storage and are
    // served from the project's `*.supabase.co` host, URL-resolved by the
    // services. Allow that host through the image optimiser so components can
    // render real media with `next/image`. Review photos come from the same
    // host via short-lived signed URLs.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
