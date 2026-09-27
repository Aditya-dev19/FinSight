/* =========================================================
   FINPULSE - SIMPLIFIED VERSION WITH FALLBACKS
========================================================= */

const RSS2JSON_API = "https://api.rss2json.com/v1/api.json?rss_url=";

/* =========================================================
   NEWS SOURCES
========================================================= */

const feeds = [
    {
        name: "Economic Times",
        url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
        region: "india"
    },
    {
        name: "CNBC",
        url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
        region: "global"
    }
];

/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let allNews = [];
let searchQuery = "";

/* =========================================================
   FINANCIAL KEYWORDS (expanded back to ~40 for better coverage)
========================================================= */

const financialKeywords = [
    // Stock market
    "stock", "stocks", "share", "shares", "equity",
    "nifty", "sensex", "nasdaq", "dow jones",
    "market", "markets", "investor", "investors",
    "trading", "rally", "ipo", "listing", "valuation",
    // Finance
    "finance", "financial", "revenue", "profit", "profits",
    "loss", "losses", "earnings", "margin", "debt",
    "investment", "investments", "funding", "capital",
    // Economy
    "economy", "economic", "gdp", "inflation",
    "interest rate", "repo rate", "monetary policy",
    "growth", "recession", "manufacturing",
    // Banking
    "bank", "banks", "banking", "loan", "loans",
    "credit", "deposit", "rbi", "federal reserve",
    // Business
    "company", "companies", "corporate", "merger",
    "acquisition", "deal", "partnership", "expansion",
    // Commodities & Currency
    "oil", "crude", "gold", "silver", "commodity",
    "rupee", "dollar", "currency", "forex",
    // Tech-finance
    "technology", "tech", "ai", "semiconductor",
    "software", "cloud", "electric vehicle"
];

/* =========================================================
   EXCLUDED NON-FINANCIAL TOPICS
========================================================= */

const excludedKeywords = [
    "fashion", "celebrity", "movie review", "bollywood",
    "hollywood", "cricket", "football", "soccer",
    "tennis", "recipe", "cooking", "travel guide",
    "horoscope", "astrology", "music release",
    "concert", "beauty", "wedding", "viral video"
];

/* =========================================================
   COMPANY DETECTION (10 well-known)
========================================================= */

const companies = [
    "Reliance", "TCS", "Infosys", "HDFC Bank",
    "ICICI Bank", "SBI", "ITC", "Airtel",
    "Apple", "Microsoft", "Amazon", "Google",
    "Nvidia", "Tesla", "Meta"
];

/* =========================================================
   POSITIVE / NEGATIVE WORDS (expanded)
========================================================= */

const positiveWords = [
    "growth", "profit", "profits", "surge", "surges",
    "rally", "gain", "gains", "rise", "rises",
    "higher", "strong", "stronger", "record",
    "beat", "beats", "upgrade", "upgraded",
    "positive", "expansion", "investment", "funding",
    "approval", "approved", "recovery", "improve",
    "improved", "increase", "increased", "boost"
];

const negativeWords = [
    "loss", "losses", "fall", "falls", "drop", "drops",
    "decline", "declines", "lower", "weak", "weaker",
    "crisis", "debt", "downgrade", "downgraded",
    "layoff", "layoffs", "cut", "cuts", "warning",
    "risk", "risks", "inflation", "recession",
    "penalty", "fine", "investigation", "lawsuit",
    "default", "slump", "crash"
];

/* =========================================================
   FALLBACK MOCK DATA — Used when RSS feeds fail
========================================================= */

const mockNews = [
    {
        title: "Sensex rallies 500 points as IT stocks surge on strong earnings",
        description: "Indian equity markets closed higher today with the Sensex gaining over 500 points, led by strong performance in technology and banking stocks. Investors showed renewed confidence following positive quarterly results.",
        link: "https://economictimes.indiatimes.com",
        source: "Economic Times",
        region: "india",
        pubDate: new Date().toISOString()
    },
    {
        title: "RBI holds interest rates steady, signals cautious outlook on inflation",
        description: "The Reserve Bank of India maintained its repo rate at current levels while expressing concerns about persistent inflation. The central bank indicated it would monitor economic data closely before making any policy changes.",
        link: "https://economictimes.indiatimes.com",
        source: "Economic Times",
        region: "india",
        pubDate: new Date(Date.now() - 3600000).toISOString()
    },
    {
        title: "Reliance Industries reports strong Q3 profit growth on retail expansion",
        description: "Reliance Industries posted better-than-expected quarterly profits, driven by robust performance in its retail and telecommunications businesses. The company announced expansion plans for the coming year.",
        link: "https://economictimes.indiatimes.com",
        source: "Economic Times",
        region: "india",
        pubDate: new Date(Date.now() - 7200000).toISOString()
    },
    {
        title: "Global markets mixed as investors weigh Fed policy and earnings",
        description: "International stock markets showed mixed performance as investors analyzed recent Federal Reserve statements and corporate earnings reports. Technology stocks led gains while energy sectors declined.",
        link: "https://www.cnbc.com",
        source: "CNBC",
        region: "global",
        pubDate: new Date(Date.now() - 10800000).toISOString()
    },
    {
        title: "Oil prices fall on concerns over global demand slowdown",
        description: "Crude oil prices declined amid worries about weakening global economic growth and rising inventories. Traders remain cautious about the impact of monetary policy on demand.",
        link: "https://www.cnbc.com",
        source: "CNBC",
        region: "global",
        pubDate: new Date(Date.now() - 14400000).toISOString()
    },
    {
        title: "Tech stocks rally as AI investment drives market optimism",
        description: "Major technology companies saw significant gains as investor enthusiasm for artificial intelligence continues to drive valuations. Analysts expect continued growth in the sector.",
        link: "https://www.cnbc.com",
        source: "CNBC",
        region: "global",
        pubDate: new Date(Date.now() - 18000000).toISOString()
    },
    {
        title: "Rupee strengthens against dollar on foreign investment inflows",
        description: "The Indian rupee appreciated against the US dollar as foreign institutional investors increased their positions in Indian equity markets. Currency traders expect the trend to continue.",
        link: "https://economictimes.indiatimes.com",
        source: "Economic Times",
        region: "india",
        pubDate: new Date(Date.now() - 21600000).toISOString()
    },
    {
        title: "Banking sector shows resilience with improved credit growth",
        description: "Indian banks reported healthy credit growth and improved asset quality in the latest quarter. Analysts remain positive on the sector's outlook despite global economic uncertainties.",
        link: "https://economictimes.indiatimes.com",
        source: "Economic Times",
        region: "india",
        pubDate: new Date(Date.now() - 25200000).toISOString()
    }
];

/* =========================================================
   CLEAN TEXT
========================================================= */

function cleanText(text) {
    if (!text) return "";
    const temp = document.createElement("div");
    temp.innerHTML = text;
    return temp.textContent.replace(/\s+/g, " ").trim();
}

/* =========================================================
   COUNT KEYWORD MATCHES
========================================================= */

function countMatches(text, keywords) {
    const lower = text.toLowerCase();
    return keywords.filter(k => lower.includes(k.toLowerCase())).length;
}

/* =========================================================
   CHECK FINANCIAL NEWS
========================================================= */

function isFinancialNews(article) {
    const text = (article.title + " " + article.description).toLowerCase();
    const financialScore = countMatches(text, financialKeywords);
    const excludedScore = countMatches(text, excludedKeywords);

    // Require at least 1 financial signal and no excluded terms
    if (financialScore >= 1 && excludedScore === 0) return true;

    // Or 2+ financial signals even with weak excluded signal
    if (financialScore >= 2 && excludedScore <= 1) return true;

    return false;
}

/* =========================================================
   SENTIMENT DETECTION
========================================================= */

function detectSentiment(article) {
    const text = (article.title + " " + article.description).toLowerCase();
    let positive = 0;
    let negative = 0;

    positiveWords.forEach(w => { if (text.includes(w)) positive++; });
    negativeWords.forEach(w => { if (text.includes(w)) negative++; });

    if (positive > negative) return "bullish";
    if (negative > positive) return "bearish";
    return "neutral";
}

/* =========================================================
   FETCH FEED WITH 5-SECOND TIMEOUT
========================================================= */

async function fetchFeed(feed) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const apiURL = RSS2JSON_API + encodeURIComponent(feed.url);
        const response = await fetch(apiURL, { signal: controller.signal });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Feed request failed");

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            throw new Error("No items in feed");
        }

        return data.items.map(item => {
            const article = {
                title: cleanText(item.title),
                description: cleanText(item.description || item.content || ""),
                link: item.link || "#",
                source: feed.name,
                region: feed.region,
                pubDate: item.pubDate || new Date().toISOString()
            };
            article.sentiment = detectSentiment(article);
            return article;
        });

    } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`Feed failed (${feed.name}):`, error.message);
        return [];  // Return empty array on error — fallback handled later
    }
}

/* =========================================================
   LOAD NEWS (with fallback)
========================================================= */

async function loadNews() {
    showLoading();

    try {
        const promises = feeds.map(feed => fetchFeed(feed));
        const results = await Promise.all(promises);

        let news = results.flat();

        // If no news from any feed, use mock data
        if (news.length === 0) {
            console.warn("All feeds failed. Loading fallback mock data.");
            news = [...mockNews];
        }

        // Filter for financial news (skip filter for mock data since it's pre-curated)
        const realNewsCount = results.flat().length;
        if (realNewsCount > 0) {
            news = news.filter(article => isFinancialNews(article));
        }

        // If filtering removed everything, use mock data
        if (news.length === 0) {
            console.warn("No financial news passed filter. Using mock data.");
            news = [...mockNews];
        }

        // Remove duplicates
        const seen = new Set();
        news = news.filter(article => {
            const key = article.title.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Ensure every article has sentiment
        news = news.map(article => {
            if (!article.sentiment) {
                article.sentiment = detectSentiment(article);
            }
            return article;
        });

        // Sort newest first
        news.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        allNews = news;

        updateMarketCard();
        updateBreakdown();
        renderNews();

        console.log(`FinPulse loaded ${allNews.length} stories.`);

    } catch (error) {
        console.error("FinPulse fatal error:", error);
        // Use mock data as last resort
        allNews = [...mockNews].map(article => {
            if (!article.sentiment) article.sentiment = detectSentiment(article);
            return article;
        });
        updateMarketCard();
        updateBreakdown();
        renderNews();
    }
}

/* =========================================================
   CALCULATE MARKET SCORE
========================================================= */

function calculateScore(articles) {
    if (articles.length === 0) return 50;

    let bullish = 0;
    let bearish = 0;

    articles.forEach(article => {
        if (article.sentiment === "bullish") bullish++;
        else if (article.sentiment === "bearish") bearish++;
    });

    const total = bullish + bearish;
    if (total === 0) return 50;

    return Math.round((bullish / total) * 100);
}

function getMarketStatus(score) {
    if (score >= 65) return "bullish";
    if (score <= 35) return "bearish";
    return "neutral";
}

/* =========================================================
   UPDATE MARKET CARD
========================================================= */

function updateMarketCard() {
    const indiaNews = allNews.filter(a => a.region === "india");

    const score = calculateScore(indiaNews);
    const status = getMarketStatus(score);

    const pointer = document.getElementById("indiaPointer");
    if (pointer) pointer.style.left = `${score}%`;

    const scoreElement = document.getElementById("indiaScore");
    if (scoreElement) scoreElement.textContent = score;

    const statusElement = document.getElementById("indiaStatus");
    if (statusElement) {
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusElement.className = `status-badge ${status}`;
    }

    const description = document.getElementById("indiaDescription");
    if (description) {
        if (status === "bullish") {
            description.textContent = "Financial news contains more positive signals than negative ones.";
        } else if (status === "bearish") {
            description.textContent = "Financial news contains more negative signals than positive ones.";
        } else {
            description.textContent = "Positive and negative signals are balanced.";
        }
    }
}

/* =========================================================
   UPDATE BREAKDOWN
========================================================= */

function updateBreakdown() {
    const total = allNews.length;

    if (total === 0) {
        setText("bullishPercent", "0%");
        setText("neutralPercent", "0%");
        setText("bearishPercent", "0%");
        setWidth("bullishBar", 0);
        setWidth("neutralBar", 0);
        setWidth("bearishBar", 0);
        return;
    }

    const bullish = allNews.filter(a => a.sentiment === "bullish").length;
    const neutral = allNews.filter(a => a.sentiment === "neutral").length;
    const bearish = allNews.filter(a => a.sentiment === "bearish").length;

    setText("bullishPercent", `${Math.round(bullish / total * 100)}%`);
    setText("neutralPercent", `${Math.round(neutral / total * 100)}%`);
    setText("bearishPercent", `${Math.round(bearish / total * 100)}%`);

    setWidth("bullishBar", Math.round(bullish / total * 100));
    setWidth("neutralBar", Math.round(neutral / total * 100));
    setWidth("bearishBar", Math.round(bearish / total * 100));
}

/* =========================================================
   FILTER & RENDER NEWS
========================================================= */

function getFilteredNews() {
    if (!searchQuery) return allNews;
    return allNews.filter(article => {
        const text = (article.title + " " + article.description).toLowerCase();
        return text.includes(searchQuery);
    });
}

function renderNews() {
    const container = document.getElementById("newsContainer");
    if (!container) return;

    const news = getFilteredNews();
    container.innerHTML = "";

    if (news.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No financial news found</h3>
                <p>Try another search.</p>
            </div>
        `;
        return;
    }

    news.forEach(article => {
        const card = createNewsCard(article);
        container.appendChild(card);
    });
}

function createNewsCard(article) {
    const card = document.createElement("article");
    card.className = "news-card";

    card.innerHTML = `
        <div class="news-top">
            <div class="news-meta">
                <span class="news-source">${escapeHTML(article.source)}</span>
                <span class="news-industry">${escapeHTML(article.region === "india" ? "India" : "Global")}</span>
            </div>
            <span class="sentiment-label ${article.sentiment}">
                ${article.sentiment.toUpperCase()}
            </span>
        </div>

        <h3>${escapeHTML(article.title)}</h3>

        <p class="news-description">
            ${escapeHTML(shorten(article.description, 250))}
        </p>

        <div class="news-bottom">
            <a href="${escapeHTML(article.link)}" class="read-link" target="_blank" rel="noopener">
                Read full article →
            </a>
        </div>
    `;

    return card;
}

/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function shorten(text, maxLength) {
    if (!text) return "No description available.";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setWidth(id, value) {
    const element = document.getElementById(id);
    if (element) element.style.width = `${value}%`;
}

function showLoading() {
    const container = document.getElementById("newsContainer");
    if (!container) return;
    container.innerHTML = `
        <div class="loading-card">
            <div class="loader"></div>
            <p>Loading financial news...</p>
        </div>
    `;
}

/* =========================================================
   SETUP & START
========================================================= */

function setupSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    input.addEventListener("input", event => {
        searchQuery = event.target.value.toLowerCase().trim();
        renderNews();
    });
}

function setupThemeToggle() {
    const button = document.getElementById("themeToggle");
    if (!button) return;

    button.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        const isLight = document.body.classList.contains("light-mode");
        localStorage.setItem("finpulseTheme", isLight ? "light" : "dark");
        button.textContent = isLight ? "🌙" : "☀️";
    });

    const savedTheme = localStorage.getItem("finpulseTheme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        button.textContent = "🌙";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("FinPulse Simplified started.");
    setupSearch();
    setupThemeToggle();
    loadNews();
});