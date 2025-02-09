/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },
}

module.exports = nextConfig