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

    // Cetak ke Log Vercel untuk cek semua fungsi yang tersedia di library
    console.log("Struktur Scrapr:", Object.keys(scrapr));

    // 1. TIKTOK
    if (url.includes("tiktok.com")) {
      if (typeof scrapr.tiktok === "function") {
        result = await scrapr.tiktok(url);
      } else if (scrapr.tiktok && typeof scrapr.tiktok.snaptik === "function") {
        result = await scrapr.tiktok.snaptik(url);
      } else if (typeof scrapr.snaptik === "function") {
        result = await scrapr.snaptik(url);
      } else {
        throw new Error("Modul TikTok tidak ditemukan di library.");
      }
    } 
    
    // 2. INSTAGRAM
    else if (url.includes("instagram.com")) {
      // Cek semua kemungkinan lokasi fungsi instagram
      if (typeof scrapr.instagram === "function") {
        result = await scrapr.instagram(url);
      } else if (scrapr.instagram && typeof scrapr.instagram.v1 === "function") {
        result = await scrapr.instagram.v1(url);
      } else if (typeof scrapr.igdl === "function") {
        result = await scrapr.igdl(url);
      } else {
        // Jika tetap gagal, tampilkan semua nama fungsi yang tersedia di library
        const available = Object.keys(scrapr).join(", ");
        throw new Error(`Fungsi Instagram tidak cocok. Fungsi tersedia di library: [ ${available} ]`);
      }
    } 

    // 3. YOUTUBE
    else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      if (typeof scrapr.youtube === "function") {
        result = await scrapr.youtube(url);
      } else if (scrapr.youtube && typeof scrapr.youtube.ytmp4 === "function") {
        result = await scrapr.youtube.ytmp4(url);
      } else {
        throw new Error("Modul YouTube tidak ditemukan di library.");
      }
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
