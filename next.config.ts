import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true,
  },
  async redirects() {
    return [
      {
        source: '/agents/:id',
        destination: '/clawdex/agent/:id',
        permanent: true,
      },
      {
        source: '/agent/:id',
        destination: '/clawdex/agent/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
