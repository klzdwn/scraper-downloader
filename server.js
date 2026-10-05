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

// Helper function untuk mencoba daftar scraper berurutan (fallback chain)
async function resolveScraper(engines, url) {
  let lastError = "Gagal memproses link";

  for (const engine of engines) {
    if (typeof engine !== "function") continue;
    try {
      const res = await engine(url);
      
      // Jika berhasil return data
      if (res && res.status !== false && (res.result || res.data || res.url)) {
        return res.result || res.data || res;
      }
      
      if (res && res.message) {
        lastError = res.message;
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  throw new Error(lastError);
}

// Endpoint Scraper API All-in-One
app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL wajib diisi!" });
  }

  try {
    let result;

    // 1. INSTAGRAM (inDown, SnapSave, Direct, SnapInsta)
    if (url.includes("instagram.com")) {
      const ig = scrapr.instagram || {};
      const engines = [
        ig.indown,
        ig.snapsave,
        ig.direct,
        ig.snapinsta,
        typeof ig === "function" ? ig : null
      ];
      result = await resolveScraper(engines, url);
    } 
    
    // 2. TIKTOK (Snaptik, Ssstik, v1)
    else if (url.includes("tiktok.com")) {
      const tt = scrapr.tiktok || {};
      const engines = [
        tt.snaptik,
        tt.ssstik,
        tt.v1,
        typeof tt === "function" ? tt : null
      ];
      result = await resolveScraper(engines, url);
    } 

    // 3. YOUTUBE
    else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const yt = scrapr.youtube || {};
      const engines = [
        yt.ytmp4,
        yt.v1,
        yt.download,
        typeof yt === "function" ? yt : null
      ];
      result = await resolveScraper(engines, url);
    } 

    // 4. FACEBOOK
    else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      const fb = scrapr.facebook || {};
      const engines = [
        fb.fdown,
        fb.v1,
        typeof fb === "function" ? fb : null
      ];
      result = await resolveScraper(engines, url);
    } 

    // 5. TWITTER / X
    else if (url.includes("twitter.com") || url.includes("x.com")) {
      const tw = scrapr.twitter || {};
      const engines = [
        tw.v1,
        tw.v2,
        typeof tw === "function" ? tw : null
      ];
      result = await resolveScraper(engines, url);
    } 

    // 6. SPOTIFY
    else if (url.includes("spotify.com")) {
      const sp = scrapr.spotify || {};
      const engines = [
        sp.download,
        sp.v1,
        typeof sp === "function" ? sp : null
      ];
      result = await resolveScraper(engines, url);
    } 
    
    else {
      return res.status(400).json({ error: "Platform belum didukung!" });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Gagal memproses link media" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
