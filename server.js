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

// Endpoint Scraper API
app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL wajib diisi!" });
  }

  try {
    let result;

    // 1. INSTAGRAM
    if (url.includes("instagram.com")) {
      result = await scrapr.instagram(url);
    } 
    // 2. TIKTOK
    else if (url.includes("tiktok.com")) {
      result = await scrapr.tiktok(url);
    } 
    // 3. YOUTUBE
    else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      result = await scrapr.youtube(url);
    } 
    // 4. FACEBOOK
    else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      result = await scrapr.facebook(url);
    } 
    // 5. TWITTER / X
    else if (url.includes("twitter.com") || url.includes("x.com")) {
      result = await scrapr.twitter(url);
    } 
    // 6. SPOTIFY
    else if (url.includes("spotify.com")) {
      result = await scrapr.spotify(url);
    } 
    // 7. THREADS
    else if (url.includes("threads.net")) {
      result = await scrapr.threads(url);
    } 
    // 8. PINTEREST
    else if (url.includes("pinterest.com") || url.includes("pin.it")) {
      result = await scrapr.pinterest(url);
    } 
    // 9. SOUNDCLOUD
    else if (url.includes("soundcloud.com")) {
      result = await scrapr.soundcloud(url);
    } 
    // 10. TERABOX
    else if (url.includes("terabox.com") || url.includes("neobox.app")) {
      result = await scrapr.terabox(url);
    } 
    else {
      return res.status(400).json({ error: "Platform belum didukung!" });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Gagal mengambil data dari platform" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
