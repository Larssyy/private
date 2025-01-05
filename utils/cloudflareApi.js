const axios = require("axios");

const cloudflareApi = axios.create({
  baseURL: "https://api.cloudflare.com/client/v4/",
  headers: {
    "X-Auth-Email": process.env.CLOUDFLARE_EMAIL,
    "X-Auth-Key": process.env.CLOUDFLARE_API_KEY,
    "Content-Type": "application/json",
  },
});

module.exports = cloudflareApi;
