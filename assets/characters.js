// FandomVerse character carousel
// Six characters are shown in one slide on desktop.
// The arrows move to the next or previous group of characters.

const CHAR_DATA_FILE = "assets/characters/char.json";
const CHARACTERS_PER_SLIDE = 6;

const charGrid = document.getElementById("characters-grid");
const charFilters = document.getElementById("category-filters");
const charPrevButton = document.getElementById("prev-btn");
const charNextButton = document.getElementById("next-btn");

const charModal = document.getElementById("character-modal");
const charCloseModalButton = document.getElementById("modal-close");
const charModalImage = document.getElementById("modal-image");
const charModalName = document.getElementById("modal-name");
const charModalCategory = document.getElementById("modal-category");
const charModalSeries = document.getElementById("modal-series");
const charModalBio = document.getElementById("modal-bio");
const charModalTraits = document.getElementById("modal-traits");

let allCharacters = [];
let filteredCharacters = [];
let currentCharCategory = "all";
let currentCharSlide = 0;

function charShowStatus(message, isError = false) {
  charGrid.innerHTML = `<p class="status-message ${isError ? "error" : ""}">${message}</p>`;
  updateCharArrowState();
}

function createCharacterCard(character) {
  const item = document.createElement("article");
  item.className = "character-item";
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute("aria-label", `Open details for ${character.name}`);

  item.innerHTML = `
    <div class="character-avatar">
      <img src="${character.image}" alt="${character.name}" loading="lazy">
    </div>
    <h2 class="character-name">${character.name}</h2>
    <span class="character-category">${character.category}</span>
  `;

  const image = item.querySelector("img");
  image.addEventListener("error", () => {
    image.src = createCharFallbackImage(character.name);
  }, { once: true });

  item.addEventListener("click", () => openCharacter(character));
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCharacter(character);
    }
  });

  return item;
}

function createCharFallbackImage(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#0f1420"/>
      <circle cx="150" cy="150" r="120" fill="#1e293b"/>
      <text x="150" y="170" text-anchor="middle" font-family="sans-serif" font-size="90" font-weight="700" fill="#c084fc">${firstLetter}</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function getCharSlides() {
  const slides = [];
  for (let i = 0; i < filteredCharacters.length; i += CHARACTERS_PER_SLIDE) {
    slides.push(filteredCharacters.slice(i, i + CHARACTERS_PER_SLIDE));
  }
  return slides;
}

function renderCurrentCharSlide() {
  const slides = getCharSlides();
  const currentCharacters = slides[currentCharSlide] || [];

  charGrid.innerHTML = "";

  if (!currentCharacters.length) {
    charShowStatus("No characters found in this category.");
    return;
  }

  currentCharacters.forEach(character => {
    charGrid.appendChild(createCharacterCard(character));
  });

  updateCharArrowState();
}

function updateCharArrowState() {
  const totalSlides = Math.ceil(filteredCharacters.length / CHARACTERS_PER_SLIDE);
  const hasMultipleSlides = totalSlides > 1;

  charPrevButton.hidden = !hasMultipleSlides;
  charNextButton.hidden = !hasMultipleSlides;

  charPrevButton.disabled = currentCharSlide === 0;
  charNextButton.disabled = currentCharSlide >= totalSlides - 1;
}

function showCharacters(category = "all") {
  currentCharCategory = category.toLowerCase();
  currentCharSlide = 0;

  if (currentCharCategory === "all") {
    filteredCharacters = allCharacters;
  } else {
    filteredCharacters = allCharacters.filter(character =>
      character.category.toLowerCase() === currentCharCategory
    );
  }

  renderCurrentCharSlide();
}

// Lets the navbar "Categories" dropdown jump straight to a filtered view.
function filterCharactersByCategory(category) {
  document.querySelectorAll("#category-filters .char-filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category.toLowerCase() === category.toLowerCase());
  });
  showCharacters(category);
}

function moveCharSlide(direction) {
  const totalSlides = Math.ceil(filteredCharacters.length / CHARACTERS_PER_SLIDE);
  const nextSlide = currentCharSlide + direction;
  if (nextSlide < 0 || nextSlide >= totalSlides) return;
  currentCharSlide = nextSlide;
  renderCurrentCharSlide();
}

function openCharacter(character) {
  charModalImage.src = character.image;
  charModalImage.alt = character.name;
  charModalImage.onerror = () => {
    charModalImage.src = createCharFallbackImage(character.name);
  };

  charModalName.textContent = character.name;
  charModalCategory.textContent = character.category;
  charModalSeries.textContent = character.series;
  charModalBio.textContent = character.bio || character.shortDesc;

  charModalTraits.innerHTML = "";
  (character.traits || []).forEach(trait => {
    const tag = document.createElement("span");
    tag.className = "char-trait";
    tag.textContent = trait;
    charModalTraits.appendChild(tag);
  });

  charModal.classList.add("open");
  charModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCharModal() {
  charModal.classList.remove("open");
  charModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

charFilters.addEventListener("click", (event) => {
  const button = event.target.closest(".char-filter-btn");
  if (!button) return;

  document.querySelectorAll("#category-filters .char-filter-btn").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  showCharacters(button.dataset.category);
});

charPrevButton.addEventListener("click", () => moveCharSlide(-1));
charNextButton.addEventListener("click", () => moveCharSlide(1));

charCloseModalButton.addEventListener("click", closeCharModal);
document.querySelector("#character-modal [data-close-modal]").addEventListener("click", closeCharModal);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && charModal.classList.contains("open")) {
    closeCharModal();
  }
  if (!charModal.classList.contains("open")) {
    if (event.key === "ArrowLeft") moveCharSlide(-1);
    if (event.key === "ArrowRight") moveCharSlide(1);
  }
});

async function loadCharacters() {
  try {
    const response = await fetch(CHAR_DATA_FILE, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load char.json (${response.status})`);

    const data = await response.json();
    if (!Array.isArray(data.characters)) {
      throw new Error("char.json must contain a characters array.");
    }

    allCharacters = data.characters;
    showCharacters("all");
  } catch (error) {
    console.error(error);
    charShowStatus("Character data could not be loaded.", true);
  }
}

loadCharacters();
