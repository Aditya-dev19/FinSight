# ◈ FinPulse — Financial News Intelligence Dashboard
A zero-dependency financial news dashboard that aggregates RSS feeds, classifies headlines by sentiment (Bullish / Neutral / Bearish), and visualizes market mood with an animated gauge. Built entirely with **vanilla HTML, CSS & JavaScript**.

🔗 **Live Demo:** finsight-omega-roan.vercel.app

## ✨ Features

- 🌐 Multi-source news aggregation (India + Global RSS feeds)
- 🧠 Rule-based sentiment analysis (Bullish / Neutral / Bearish)
- 📊 Interactive market sentiment gauge with animated pointer
- 📈 News breakdown with percentage bars
- 🔍 Real-time keyword search
- 🎨 Dark / Light theme toggle (persisted via `localStorage`)
- 🛡️ Three-layer fallback — never shows an empty page
- ⏱️ 5-second fetch timeout via `AbortController`
- 📱 Fully responsive (CSS Grid + Flexbox)
- 🔒 XSS-safe rendering with HTML escaping

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (Grid, Flexbox, Custom Properties) |
| Logic | Vanilla JavaScript (ES6+, async/await) |
| Data | RSS feeds via [RSS2JSON](https://rss2json.com) |
| Hosting | GitHub Pages |
