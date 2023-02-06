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
    MATIC_PRIVATE_KEY: process.env.NEXT_PUBLIC_MATIC_PRIVATE_KEY,
    MATIC_LINK: process.env.NEXT_PUBLIC_MATIC_LINK,
    PUBLIC_KEY: process.env.NEXT_PUBLIC_PUBLIC_KEY,
    STORAGE_KEY: process.env.NEXT_PUBLIC_STORAGE_KEY,
    NFT_KEY: process.env.NEXT_PUBLIC_NFT_KEY,
    FIREBASE_APIKEY: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    FIREBASE_AUTHDOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    FIREBASE_DATABASEURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASEURL,
    FIREBASE_PROJECTID: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    FIREBASE_STORAGEBUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    FIREBASE_MESSAGINGSENDERID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    FIREBASE_APPID: process.env.NEXT_PUBLIC_FIREBASE_APPID,
    FIREBASE_MEASUREMENTID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
    HUDDLE: process.env.NEXT_PUBLIC_HUDDLE,
  },
};

module.exports = {
  images: {
    loader: "akamai",
    path: "",
  },
  nextConfig,
};
