import ImageKit from "@imagekit/nodejs";

console.log("Loaded private key:", process.env.IMAGEKIT_PRIVATE_KEY);

const imagekit = process.env.IMAGEKIT_PRIVATE_KEY
  ? new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY })
  : null;

export default imagekit;