let mediaData = [], currentMediaCategory = 'All', currentMediaType = 'all';

async function fetchMediaData() {
  try {
    const response = await fetch('assets/media/media.json');
    if (!response.ok) throw new Error('media.json not reachable');
    mediaData = await response.json();
  } catch (error) {
    console.warn("Could not fetch media.json", error);
    mediaData = [];
  }
  renderMediaPlaylist();
}

function renderMediaPlaylist() {
  const container = document.getElementById('playlistContainer');
  if (!container) return;
  container.innerHTML = '';
  const filtered = mediaData.filter(item =>
    ((currentMediaCategory === 'All') || (item.category === currentMediaCategory)) &&
    ((currentMediaType === 'all') || (item.type === currentMediaType))
  );
  if (!filtered.length) {
    container.innerHTML = '<p class="media-sub-heading small p-3">No content found for selected category/filter.</p>';
    return;
  }
  filtered.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = `playlist-item d-flex align-items-center gap-3 ${index === 0 ? 'active' : ''}`;
    itemEl.onclick = () => loadMediaItem(item, itemEl);
    itemEl.innerHTML = `
      <img src="${item.thumbnail}" class="playlist-thumb" alt="thumb" onerror="this.src='https://placehold.co/80x55/0f1420/c084fc?text=Media'">
      <div class="flex-grow-1 overflow-hidden">
          <div class="fw-bold small text-truncate text-white">${item.title}</div>
          <div class="d-flex justify-content-between align-items-center mt-1">
              <span class="badge badge-brand extra-small">${item.category}</span>
              <span class="media-sub-heading extra-small"><i class="fa-regular fa-clock"></i> ${item.duration}</span>
          </div>
      </div>`;
    container.appendChild(itemEl);
  });
  if (filtered.length > 0) loadMediaItem(filtered[0], container.children[0]);
}

function loadMediaItem(item, element) {
  document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');

  document.getElementById('activeTitle').textContent = item.title;
  document.getElementById('activeDesc').textContent = item.description;
  document.getElementById('activeBadge').textContent = `${item.category} • ${item.type.toUpperCase()}`;

  const videoBlock = document.getElementById('videoDisplayBlock');
  const audioBlock = document.getElementById('audioDisplayBlock');
  const iframePlayer = document.getElementById('mainYoutubePlayer');
  const audioPlayer = document.getElementById('mainAudioPlayer');

  if (item.type === 'podcasts' || item.audioUrl) {
    iframePlayer.src = '';
    videoBlock.style.display = 'none';
    audioBlock.style.display = 'block';

    document.getElementById('audioTrackTitle').textContent = item.title;
    document.getElementById('audioTrackCat').textContent = item.category;

    audioPlayer.pause();
    audioPlayer.src = item.audioUrl;
    audioPlayer.load();
  } else {
    audioPlayer.pause();
    audioPlayer.src = '';
    audioBlock.style.display = 'none';
    videoBlock.style.display = 'block';
    iframePlayer.src = item.youtubeEmbedUrl || item.videoUrl;
  }
}

document.getElementById('categorySelect').addEventListener('change', e => {
  currentMediaCategory = e.target.value;
  renderMediaPlaylist();
});

document.querySelectorAll('#typeFilterGroup .media-filter-btn').forEach(btn =>
  btn.addEventListener('click', function () {
    document.querySelectorAll('#typeFilterGroup .media-filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentMediaType = this.getAttribute('data-type');
    renderMediaPlaylist();
  })
);

document.addEventListener('DOMContentLoaded', fetchMediaData);
