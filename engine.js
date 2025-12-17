// ------------------- Sections & Countries -------------------
const sections = {
    "Asia": ["India","China","Japan","South Korea","Indonesia"],
    "Europe": ["Germany","UK","France","Italy","Spain"],
    "Americas": ["USA","Canada","Brazil","Mexico","Argentina"],
    "Africa": ["Nigeria","South Africa","Egypt","Kenya","Morocco"],
    "Oceania": ["Australia","New Zealand","Fiji","Papua New Guinea","Samoa"]
    // बाकी countries extend करो, total 150+
};

// RSS feed mapping (demo, extend for all countries)
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
    // Extend all 150 countries with valid RSS feeds
};

// ------------------- Local Cache -------------------
let newsCache = {};

// ------------------- Fetch News Function -------------------
async function fetchCountryNews(country){
    if(newsCache[country]) return newsCache[country];

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
        console.error("News fetch failed for", country, e);
        return [];
    }
}

// ------------------- Create News Item -------------------
function createNewsItem(article){
    const div = document.createElement("div");
    div.className = "news-item";
    div.innerHTML = `• <a href="${article.link}" target="_blank">${article.title}</a> (${article.pubDate})`;
    return div;
}

// ------------------- Render Engine -------------------
function renderEngine(){
    const container = document.getElementById("engineContainer");

    for(const sectionName in sections){
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "section";

        const titleDiv = document.createElement("div");
        titleDiv.className = "section-title";
        titleDiv.innerText = sectionName + " (Click to Expand)";
        sectionDiv.appendChild(titleDiv);

        const countriesContainer = document.createElement("div");
        countriesContainer.className = "countries-container";
        sectionDiv.appendChild(countriesContainer);

        // Toggle section visibility
        titleDiv.onclick = () => {
            countriesContainer.style.display = countriesContainer.style.display==="none"?"block":"none";
        };

        for(const country of sections[sectionName]){
            const countryDiv = document.createElement("div");
            countryDiv.className = "country-block";

            const countryTitle = document.createElement("div");
            countryTitle.className = "country-title";
            countryTitle.innerText = country;
            countryDiv.appendChild(countryTitle);

            const newsList = document.createElement("div");
            newsList.className = "news-list";
            countryDiv.appendChild(newsList);

            // Toggle news list on country click
            countryTitle.onclick = async () => {
                if(newsList.childElementCount === 0){
                    const articles = await fetchCountryNews(country);
                    articles.forEach(a => {
                        newsList.appendChild(createNewsItem(a));
                    });
                }
                newsList.style.display = newsList.style.display==="none"?"block":"none";
            };

            countriesContainer.appendChild(countryDiv);
        }

        container.appendChild(sectionDiv);
    }
}

// Initialize
renderEngine();
