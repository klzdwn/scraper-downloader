const express = require("express");
const cors = require("cors");
const path = require("path");
const scrapr = require("@coflyn/scrapr");

const app = express();

app.use(cors());
app.use(express.json());

// Serve file HTML statis
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint Scraper API All-in-One
app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL wajib diisi!" });
  }

  try {
    let result;

    // 1. TIKTOK
    if (url.includes("tiktok.com")) {
      const fn = scrapr.tiktok?.snaptik || scrapr.tiktok?.ssstik || scrapr.tiktok?.v1;
      if (typeof fn === "function") result = await fn(url);
      else throw new Error("Scraper TikTok tidak dapat diproses");
    } 
    
    // 2. INSTAGRAM
    else if (url.includes("instagram.com")) {
      const ig = scrapr.instagram || {};
      const fn = ig.v1 || ig.v2 || ig.v3 || ig.download || ig.igdl;
      if (typeof fn === "function") {
        result = await fn(url);
      } else if (typeof ig === "function") {
        result = await ig(url);
      } else {
        throw new Error("Scraper Instagram tidak dapat diproses");
      }
    } 
    
    // 3. YOUTUBE
    else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const yt = scrapr.youtube || {};
      const fn = yt.ytmp4 || yt.v1 || yt.download;
      if (typeof fn === "function") result = await fn(url);
      else throw new Error("Scraper YouTube tidak dapat diproses");
    } 
    
    // 4. FACEBOOK
    else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      const fb = scrapr.facebook || {};
      const fn = fb.fdown || fb.v1 || fb.download;
      if (typeof fn === "function") result = await fn(url);
      else throw new Error("Scraper Facebook tidak dapat diproses");
    } 
    
    // 5. TWITTER / X
    else if (url.includes("twitter.com") || url.includes("x.com")) {
      const tw = scrapr.twitter || {};
      const fn = tw.v1 || tw.v2 || tw.download;
      if (typeof fn === "function") result = await fn(url);
      else throw new Error("Scraper Twitter/X tidak dapat diproses");
    } 
    
    // 6. SPOTIFY
    else if (url.includes("spotify.com")) {
      const sp = scrapr.spotify || {};
      const fn = sp.download || sp.v1;
      if (typeof fn === "function") result = await fn(url);
      else throw new Error("Scraper Spotify tidak dapat diproses");
    } 
    
    else {
      return res.status(400).json({ error: "Platform belum didukung!" });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Gagal mengekstrak media" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
