/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "i.pinimg.com",
      "upload.wikimedia.org",
      "user-images.githubusercontent.com",
      "media.istockphoto.com",
      "lh3.googleusercontent.com",
      "map0.daumcdn.net",
      "map2.daumcdn.net",
    ],
  },
};

module.exports = nextConfig;
