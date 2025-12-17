// ------------------- Countries & Sections -------------------
// Example: First 5 Asian countries, rest grouped by continents
const sections = {
    "Asia": ["India","China","Japan","South Korea","Indonesia"],
    "Europe": ["Germany","France","UK","Italy","Spain"], // continue for all Europe
    "Americas": ["USA","Canada","Brazil","Mexico"], // continue for all Americas
    // Add remaining continents/regions up to 150+ countries
};

// Simple RSS feed mapping (example, extend for all countries)
const rssFeeds = {
    "India":"https://rss.cnn.com/rss/edition_india.rss",
    "China":"https://rss.cnn.com/rss/edition_asia.rss",
    "Japan":"https://rss.cnn.com/rss/edition_asia.rss",
    "South Korea":"https://rss.cnn.com/rss/edition_asia.rss",
    "Indonesia":"https://rss.cnn.com/rss/edition_asia.rss",
    "USA":"https://rss.cnn.com/rss/edition_us.rss",
    "Canada":"https://rss.cnn.com/rss/edition_canada.rss",
    "Brazil":"https://rss.cnn.com/rss/edition_latam.rss",
    "Germany":"http://feeds.bbci.co.uk/news/world/europe/rss.xml",
    "UK":"http://feeds.bbci.co.uk/news/uk/rss.xml"
    // Extend for all 150 countries
};

// Local cache for fetched news
let newsCache = {};

// ------------------- Utility Functions -------------------
async function fetchCountryNews(country){
    if(newsCache[country]) return newsCache[country]; // return cached if exists

    try{
        const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
        const feed = rssFeeds[country];
        if(!feed) return [];

        const res = await fetch(proxy + encodeURIComponent(feed));
        const data = await res.json();

        const articles = data.items.slice(0,20).map(a => ({
            title: a.title,
            link: a.link,
            pubDate: a.pubDate
        }));

        newsCache[country] = articles;
        return articles;
    }catch(e){
        console.error("Failed to fetch news for", country, e);
        return [];
    }
}

function createNewsItem(article){
    const div = document.createElement("div");
    div.className = "news-item";
    div.innerHTML = `• <a href="${article.link}" target="_blank">${article.title}</a> (${article.pubDate})`;
    return div;
}

function playAudio(url){
    let audio = new Audio(url);
    audio.play();
}

// ------------------- Engine Rendering -------------------
async function renderEngine(){
    const container = document.getElementById("engineContainer");
    container.innerHTML = "";

    for(const sectionName in sections){
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "section";

        const titleDiv = document.createElement("div");
        titleDiv.className = "section-title";
        titleDiv.innerText = sectionName + " (Click to expand)";
        sectionDiv.appendChild(titleDiv);

        // Container for countries
        const countriesContainer = document.createElement("div");
        countriesContainer.style.display = "none";
        sectionDiv.appendChild(countriesContainer);

        // Toggle visibility
        titleDiv.onclick = () => {
            countriesContainer.style.display = countriesContainer.style.display === "none" ? "block" : "none";
        };

        for(const country of sections[sectionName]){
            const countryDiv = document.createElement("div");
            countryDiv.className = "country-block";

            const countryTitle = document.createElement("div");
            countryTitle.className = "country-title";
            countryTitle.innerText = country;
            countryDiv.appendChild(countryTitle);

            const fetchBtn = document.createElement("button");
            fetchBtn.innerText = "Load Top 20 News";
            fetchBtn.onclick = async () => {
                const articles = await fetchCountryNews(country);
                articles.forEach(a => {
                    countryDiv.appendChild(createNewsItem(a));
                });
                fetchBtn.disabled = true; // Prevent re-fetch
            };
            countryDiv.appendChild(fetchBtn);

            countriesContainer.appendChild(countryDiv);
        }

        container.appendChild(sectionDiv);
    }
}

// ------------------- Initialize Engine -------------------
renderEngine();
