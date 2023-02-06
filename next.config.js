/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
  env: {
    MATIC_PRIVATE_KEY: process.env.MATIC_PRIVATE_KEY,
    MATIC_LINK: process.env.MATIC_LINK,
    PUBLIC_KEY: process.env.PUBLIC_KEY,
    STORAGE_KEY: process.env.STORAGE_KEY,
    NFT_KEY: process.env.NFT_KEY,
    FIREBASE_APIKEY: process.env.FIREBASE_APIKEY,
    FIREBASE_AUTHDOMAIN: process.env.FIREBASE_AUTHDOMAIN,
    FIREBASE_DATABASEURL: process.env.FIREBASE_DATABASEURL,
    FIREBASE_PROJECTID: process.env.FIREBASE_PROJECTID,
    FIREBASE_STORAGEBUCKET: process.env.FIREBASE_STORAGEBUCKET,
    FIREBASE_MESSAGINGSENDERID: process.env.FIREBASE_MESSAGINGSENDERID,
    FIREBASE_APPID: process.env.FIREBASE_APPID,
    FIREBASE_MEASUREMENTID: process.env.FIREBASE_MEASUREMENTID,
    HUDDLE: process.env.HUDDLE,
  },
};

module.exports = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  nextConfig,
};
