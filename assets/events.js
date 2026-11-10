let eventData = {};

function eventFallbackImage(category) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#a855f7"/>
          <stop offset="1" stop-color="#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="600" height="280" fill="#111827"/>
      <rect width="600" height="280" fill="url(#g)" opacity="0.18"/>
      <text x="300" y="150" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="700" fill="#ffffff">${category}</text>
    </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function buildEventCard(event) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="event-card">
        <span class="event-date"><i class="fa-regular fa-calendar"></i> ${event.date}</span>
        <h3>${event.title}</h3>
        <div class="event-location"><i class="fa-solid fa-location-dot"></i> ${event.location}</div>
        <p>${event.description}</p>
        <div class="event-bottom">
          <span class="event-category"><i class="${event.categoryIcon}"></i> ${event.category}</span>
          <button class="event-btn" onclick="openEvent('${event.id}')">Details →</button>
        </div>
      </div>
    </div>
  `;
}

function renderEvents(events) {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;
  grid.innerHTML = events.map(buildEventCard).join("");
}

function loadEvents() {
  fetch("assets/events/events.json")
    .then(res => res.json())
    .then(data => {
      const events = data.events || [];

      events.forEach(event => {
        eventData[event.id] = {
          title: event.title,
          date: event.dateFull,
          location: event.location,
          category: event.category,
          image: eventFallbackImage(event.category),
          description: event.modalDescription
        };
      });

      renderEvents(events);
    })
    .catch(err => console.error("Could not load events.json:", err));
}

loadEvents();

// visitor counter
let visitors = localStorage.getItem("fandomVerseVisitors");
visitors = visitors === null ? 1250 : parseInt(visitors) + 1;
localStorage.setItem("fandomVerseVisitors", visitors);
document.getElementById("visitorCount").textContent = Number(visitors).toLocaleString();

// live date & time
function updateDateTime() {
  const now = new Date();

  document.getElementById("liveDate").textContent = now.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  document.getElementById("liveClock").textContent = now.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

updateDateTime();
setInterval(updateDateTime, 1000);

// event modal
function openEvent(eventName) {
  const event = eventData[eventName];
  if (!event) return;

  document.getElementById("modalImage").src = event.image;
  document.getElementById("modalImage").alt = event.title;
  document.getElementById("modalTitle2").textContent = event.title;
  document.getElementById("modalDate").textContent = event.date;
  document.getElementById("modalLocation").textContent = event.location;
  document.getElementById("modalCategory").textContent = event.category;
  document.getElementById("modalDescription").textContent = event.description;

  document.getElementById("eventModal").classList.add("active");
  document.body.classList.add("modal-open");
}

function closeEvent() {
  document.getElementById("eventModal").classList.remove("active");
  document.body.classList.remove("modal-open");
}

document.getElementById("eventModal").addEventListener("click", function (event) {
  if (event.target === this) closeEvent();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeEvent();
});
