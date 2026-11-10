// Fandom Hubs — 7 category cards, hub modal and book/comic reader.

const HUB_ASSET = "assets/hubs/";
let hubsExpanded = false;
let activeHubReader = null;
let activeHubReaderPage = 0;

const fandomHubs = [
  { title: "Anime Hub", char: "Arai Sora", tone: "anime", desc: "Anime series, character lore, seasonal releases and watch parties.", img: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=900&auto=format&fit=crop" },
  { title: "Gaming Hub", char: "Nova Drift", tone: "gaming", desc: "Games, esports, walkthroughs, soundtracks and community highlights.", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop" },
  { title: "Movies Hub", char: "Cipher Mask", tone: "movies", desc: "Movies, trailers, behind-the-scenes features and cinematic deep dives.", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=900&auto=format&fit=crop" },
  { title: "K-Pop Hub", char: "Neon Seoul", tone: "kpop", desc: "Music videos, performances, comeback coverage and fan content.", img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=900&auto=format&fit=crop" },
  { title: "TV Shows Hub", char: "Hawkins Eleven", tone: "tv", desc: "Episodes, recaps, interviews, theories and soundtrack collections.", img: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=900&auto=format&fit=crop" },
  { title: "Manga Hub", char: "Manga Library", tone: "manga", desc: "Read manga chapters and scan pages in the dedicated book reader.", img: HUB_ASSET + "sukainaimg1.webp" },
  { title: "Comics Hub", char: "Comic Library", tone: "comics", desc: "Browse comic covers and open supplied issues in the reader.", img: HUB_ASSET + "spiderman.webp" }
];

const hubBooks = [
  { id: "manga-ch0", type: "manga", typeLabel: "MANGA", title: "Manga Chapter 0", subtitle: "Supplied chapter scan", cover: HUB_ASSET + "ch_0_1.webp", pages: [1, 2, 3, 4, 5, 6].map(n => `${HUB_ASSET}ch_0_${n}.webp`), note: "Six interior scan pages were supplied with this project." },
  { id: "green-lantern", type: "comic", typeLabel: "COMIC", title: "Green Lantern 5 Special", subtitle: "Cover preview", cover: HUB_ASSET + "sukainaimg1.webp", pages: [], note: "Cover asset supplied. Interior pages were not included for this title." },
  { id: "walking-dead", type: "comic", typeLabel: "COMIC", title: "The Walking Dead", subtitle: "Cover preview", cover: HUB_ASSET + "the-walking-dead.webp", pages: [], note: "Cover asset supplied. Interior pages were not included for this title." },
  { id: "paper-girls", type: "comic", typeLabel: "COMIC", title: "Paper Girls", subtitle: "Cover preview", cover: HUB_ASSET + "paper-girls.webp", pages: [], note: "Cover asset supplied. Interior pages were not included for this title." },
  { id: "monstress", type: "manga", typeLabel: "MANGA", title: "Monstress", subtitle: "Cover preview", cover: HUB_ASSET + "monster.jpg.jpeg", pages: [], note: "Cover asset supplied. Interior pages were not included for this title." },
  { id: "spider-man", type: "comic", typeLabel: "COMIC", title: "The Amazing Spider-Man", subtitle: "Cover preview", cover: HUB_ASSET + "spiderman.webp", pages: [], note: "Cover asset supplied. Interior pages were not included for this title." }
];

const booksByHub = {
  "Manga Hub": hubBooks.filter(b => b.type === "manga"),
  "Comics Hub": hubBooks.filter(b => b.type === "comic")
};

function escapeHubText(value) {
  return String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

function renderFandomHubs() {
  const grid = document.getElementById("fandomHubGrid");
  if (!grid) return;

  grid.innerHTML = fandomHubs.map((hub, index) => `
    <article class="hub-card ${index > 3 ? "hub-extra" : ""} hub-${hub.tone}" data-index="${index}">
      <button class="hub-image-btn" type="button" onclick="openHubModal(${index})" aria-label="Open ${escapeHubText(hub.title)}">
        <img src="${escapeHubText(hub.img)}" alt="${escapeHubText(hub.title)}" loading="lazy" onerror="this.style.display='none'">
        <span class="hub-card-shade"></span>
        <span class="hub-char-pill">${escapeHubText(hub.char)}</span>
      </button>
      <div class="hub-card-body">
        <div>
          <span class="hub-mini-label">Fandom hub</span>
          <h3>${escapeHubText(hub.title)}</h3>
        </div>
        <button class="hub-round-btn" type="button" onclick="openHubModal(${index})" aria-label="Explore ${escapeHubText(hub.title)}">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </article>`).join("");

  applyHubExpandedState();
}

function toggleHubCategories() {
  hubsExpanded = !hubsExpanded;
  applyHubExpandedState();
}

function applyHubExpandedState() {
  document.querySelectorAll(".hub-extra").forEach(el => { el.hidden = !hubsExpanded; });
  const text = document.getElementById("hubsViewAllText");
  const arrow = document.getElementById("hubsViewAllArrow");
  const btn = document.getElementById("hubsViewAllBtn");
  if (!text || !arrow || !btn) return;
  text.textContent = hubsExpanded ? "Show Less" : "View All";
  arrow.className = hubsExpanded ? "fa-solid fa-arrow-up" : "fa-solid fa-arrow-right";
  btn.setAttribute("aria-expanded", String(hubsExpanded));
}

function openHubModal(index) {
  const hub = fandomHubs[index];
  if (!hub) return;

  document.getElementById("hubModalImg").src = hub.img;
  document.getElementById("hubModalImg").alt = hub.title;
  document.getElementById("hubModalChar").textContent = "Featured: " + hub.char;
  document.getElementById("hubModalTitle").textContent = hub.title;
  document.getElementById("hubModalDesc").textContent = hub.desc;

  const readArea = document.getElementById("hubModalReadArea");
  const booksForHub = booksByHub[hub.title] || [];

  if (booksForHub.length) {
    readArea.innerHTML = booksForHub.map(book => `
      <div class="hub-modal-read-row">
        <div><span class="hub-mini-label">${escapeHubText(book.typeLabel)}</span><strong>${escapeHubText(book.title)}</strong></div>
        <button class="hub-primary-btn" type="button" onclick="openHubReader('${book.id}')">Read <i class="fa-solid fa-book-open"></i></button>
      </div>`).join("");
  } else {
    readArea.innerHTML = `<a class="hub-primary-btn" href="#merch">Shop related merch <i class="fa-solid fa-cart-shopping"></i></a>`;
  }

  const modal = document.getElementById("hubModal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeHubModal() {
  const modal = document.getElementById("hubModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!document.getElementById("hubReaderModal").classList.contains("open")) {
    document.body.style.overflow = "";
  }
}

function openHubReader(id) {
  closeHubModal();
  activeHubReader = hubBooks.find(b => b.id === id);
  if (!activeHubReader) return;
  activeHubReaderPage = 0;

  document.getElementById("hubReaderTitle").textContent = activeHubReader.title;
  document.getElementById("hubReaderSubtitle").textContent = activeHubReader.typeLabel + " • " + activeHubReader.subtitle;
  document.getElementById("hubReaderCover").src = activeHubReader.cover;
  document.getElementById("hubReaderBookType").textContent = activeHubReader.typeLabel;
  document.getElementById("hubReaderNote").textContent = activeHubReader.note;

  renderHubThumbnails();
  updateHubReaderDisplay();

  const modal = document.getElementById("hubReaderModal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeHubReaderModal() {
  const modal = document.getElementById("hubReaderModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  activeHubReader = null;
}

function renderHubThumbnails() {
  const strip = document.getElementById("hubThumbnailStrip");
  if (!activeHubReader.pages.length) {
    strip.innerHTML = '<div class="hub-thumb-empty">Cover only</div>';
    return;
  }
  strip.innerHTML = activeHubReader.pages.map((src, i) => `
    <button class="hub-thumb ${i === activeHubReaderPage ? "active" : ""}" type="button" onclick="goToHubPage(${i})">
      <img src="${src}" alt="Page ${i + 1}">
    </button>`).join("");
}

function goToHubPage(index) {
  activeHubReaderPage = Math.max(0, Math.min(index, activeHubReader.pages.length - 1));
  updateHubReaderDisplay();
  renderHubThumbnails();
}

function changeHubReaderPage(direction) {
  if (!activeHubReader || !activeHubReader.pages.length) return;
  goToHubPage(activeHubReaderPage + direction);
}

function updateHubReaderDisplay() {
  const hasPages = !!activeHubReader.pages.length;
  const img = document.getElementById("hubReaderImg");
  const empty = document.getElementById("hubReaderEmpty");

  document.getElementById("hubReaderPageCount").textContent = hasPages ? `${activeHubReader.pages.length} pages` : "Cover preview";
  document.getElementById("hubPageIndicator").textContent = hasPages ? `Page ${activeHubReaderPage + 1} / ${activeHubReader.pages.length}` : "Cover preview";
  document.getElementById("hubPrevPageBtn").disabled = !hasPages || activeHubReaderPage === 0;
  document.getElementById("hubNextPageBtn").disabled = !hasPages || activeHubReaderPage === activeHubReader.pages.length - 1;

  if (hasPages) {
    img.hidden = false;
    empty.hidden = true;
    img.src = activeHubReader.pages[activeHubReaderPage];
    img.alt = `${activeHubReader.title} page ${activeHubReaderPage + 1}`;
  } else {
    img.hidden = true;
    empty.hidden = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderFandomHubs();

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeHubModal();
      closeHubReaderModal();
    }
    if (document.getElementById("hubReaderModal").classList.contains("open") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      changeHubReaderPage(e.key === "ArrowRight" ? 1 : -1);
    }
  });
});
