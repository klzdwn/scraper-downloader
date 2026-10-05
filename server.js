const express = require("express");
const cors = require("cors");
const path = require("path");
const { tiktok, instagram } = require("@coflyn/scrapr");

const app = express();

app.use(cors());
app.use(express.json());

// Sajikan file HTML & statis dari folder yang sama
app.use(express.static(path.join(__dirname)));

// Endpoint Halaman Utama (Website)
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
    if (url.includes("tiktok.com")) {
      result = await tiktok.snaptik(url);
    } else if (url.includes("instagram.com")) {
      result = await instagram.igdl(url);
    } else {
      return res.status(400).json({ error: "Platform belum didukung" });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Gagal mengambil data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
