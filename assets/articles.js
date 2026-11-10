const BOOKMARKS_STORAGE_KEY = 'fandomverse_bookmarks';

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveBookmarks(list) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    /* localStorage unavailable — bookmarks stay in-memory for this visit */
  }
}

let bookmarkedArticles = loadBookmarks();

function toggleBookmark(id, btn) {
  const card = btn.closest('.article-card');
  const alreadyBookmarked = bookmarkedArticles.some(item => item.id === id);

  if (alreadyBookmarked) {
    bookmarkedArticles = bookmarkedArticles.filter(item => item.id !== id);
  } else if (card) {
    bookmarkedArticles.push({
      id,
      title: card.querySelector('h3').textContent,
      img: card.querySelector('.article-thumb img').src,
      tags: Array.from(card.querySelectorAll('.article-pill')).map(pill => pill.textContent)
    });
  }

  btn.classList.toggle('active', !alreadyBookmarked);
  saveBookmarks(bookmarkedArticles);
  renderBookmarks();
}

function renderBookmarks() {
  const grid = document.getElementById('bookmarksGrid');
  const empty = document.getElementById('bookmarksEmpty');
  if (!grid || !empty) return;

  if (!bookmarkedArticles.length) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = bookmarkedArticles.map(item => `
    <article class="article-card">
      <div class="article-thumb">
        <img src="${item.img}" alt="${item.title}" loading="lazy">
        <span class="thumb-tag">FANDOMVERSE · SAVED</span>
        <button class="bookmark-btn active" onclick="toggleBookmark(${item.id}, this)" aria-label="Remove bookmark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>
        </button>
      </div>
      <div class="article-body">
        <div class="article-meta">${item.tags.map(t => `<span class="article-pill">${t}</span>`).join('')}</div>
        <h3>${item.title}</h3>
        <a class="read-link" onclick="openArticle(${item.id})">Read article</a>
      </div>
    </article>`).join('');
}

function syncBookmarkButtons() {
  document.querySelectorAll('.article-card[data-article-id]').forEach(card => {
    const id = Number(card.dataset.articleId);
    const btn = card.querySelector('.bookmark-btn');
    if (btn) btn.classList.toggle('active', bookmarkedArticles.some(item => item.id === id));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  syncBookmarkButtons();
  renderBookmarks();
});

const articlesData = {
  1: {
    tags: ['Anime', 'Article'],
    title: 'Voice Cast Confirmed for Season Three',
    content: `
      <p>The returning cast list quietly answers the question fans have been asking since the finale. After months of rumors and online leaks, studio representatives officially released the complete voice lineup today.</p>
      <p>Key original cast members have officially signed on to reprise their roles. Additionally, two mysterious new characters will join the storyline, voiced by industry veterans known for their standout performances in major anime franchises.</p>
      <p>Production is running according to schedule, with sound recording sessions currently underway.</p>
    `
  },
  2: {
    tags: ['Gaming', 'Article'],
    title: 'Patch 4.2 Reworks the Ranked Ladder',
    content: `
      <p>A complete breakdown of what changes for ranked climbers, and which high-tier characters lose their edge in the new meta shift.</p>
      <p>Developers have focused on reducing snow-ball mechanics in early game fights, giving underperforming hero classes a much-needed defense buff. Matchmaking algorithms have also been tweaked to prioritize latency over raw rank gaps.</p>
      <p>Expect significant changes to seasonal ranking rewards starting next week!</p>
    `
  },
  3: {
    tags: ['Comics', 'Article'],
    title: 'Behind the Cover: Sketch to Print',
    content: `
      <p>The lead cover artist walks readers through three discarded concepts before landing on the final, vibrant composition that graced issue #50.</p>
      <p>Initial sketches focused heavily on action scenes, but feedback shifted the focus toward character-driven emotional tension. Utilizing hybrid digital-inking techniques, the final layout achieves an iconic retro neon finish.</p>
    `
  },
  4: {
    tags: ['Movies', 'Article'],
    title: 'The Deleted Scene That Explains Everything',
    content: `
      <p>A ten-second cut scene released in the special collector's edition completely resolves the plot confusion that has divided the fanbase since release.</p>
      <p>The scene shows a brief conversation confirming the main character's true motives, filling in a major narrative gap created during the theatrical edit phase.</p>
    `
  }
};

function openArticle(id) {
  const data = articlesData[id];
  if (!data) return;

  const metaContainer = document.getElementById('modalMeta');
  metaContainer.innerHTML = data.tags.map(t => `<span class="article-pill">${t}</span>`).join('');

  document.getElementById('modalTitle').innerText = data.title;
  document.getElementById('modalBody').innerHTML = data.content;

  document.getElementById('articleModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeArticle() {
  document.getElementById('articleModal').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function closeArticleOnBg(e) {
  if (e.target.id === 'articleModal') {
    closeArticle();
  }
}
