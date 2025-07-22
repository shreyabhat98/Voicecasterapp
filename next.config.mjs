/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      turbo: false, // fallback to Webpack
      appDir: true,
    },
  };
  
  export default nextConfig;
  