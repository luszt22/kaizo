import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Search Roblox Usernames
  // In a real app, this would call Roblox APIs. 
  // For this demo, we simulate a "backend" that searches a predefined list.
  app.get("/api/search-roblox", async (req, res) => {
    const q = (req.query.q as string || "").trim();
    if (!q || q.length < 3) return res.json([]);
    
    try {
      // 1. Search for users by keyword
      const searchUrl = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(q)}&limit=10`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchData.data || searchData.data.length === 0) {
        return res.json([]);
      }

      // 2. Get user IDs to fetch thumbnails
      const userIds = searchData.data.map((u: any) => u.id).join(",");
      const thumbUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=150x150&format=Png&isCircular=false`;
      const thumbRes = await fetch(thumbUrl);
      const thumbData = await thumbRes.json();

      // 3. Map results together
      const results = searchData.data.map((u: any) => {
        const thumb = thumbData.data?.find((t: any) => t.targetId === u.id);
        return {
          display: u.displayName,
          username: u.name,
          avatarUrl: thumb ? thumb.imageUrl : null,
          avatarLetter: u.displayName.charAt(0).toUpperCase()
        };
      });

      res.json(results);
    } catch (error) {
      console.error("Roblox API Error:", error);
      res.status(500).json({ error: "Failed to fetch from Roblox" });
    }
  });

  // API Route: Send Robux (Simulated)
  app.post("/api/send-robux", (req, res) => {
    const { from, to, amount } = req.body;
    console.log(`[BACKEND] ${amount} Robux sent from @${from} to @${to}`);
    res.json({ success: true, message: `Successfully sent ${amount} Robux!` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
