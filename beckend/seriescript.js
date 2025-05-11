(async function() {
  // === Busca JSONs ANTES de mais nada ===
  let filmes = [], series = [], animes = [];
  async function fetchCatalogData() {
    try {
      const [fRes, sRes, aRes] = await Promise.all([
        fetch('./json/filmes.json'),
        fetch('./json/series.json'),
        fetch('./json/animes.json')
      ]);
      filmes = await fRes.json();
      series = await sRes.json();
      animes = await aRes.json();
    } catch (e) {
      console.error('Erro ao carregar catálogo:', e);
      alert('Não foi possível carregar o catálogo.');
    }
  }
  await fetchCatalogData();

  // === Navbar & pesquisa (cópia exata da versão que funciona) ===
  const searchIcon    = document.getElementById('search-icon');
  const searchBar     = document.getElementById('search-bar');
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // hover/focus
  searchIcon.addEventListener('mouseover', () => searchBar.classList.add('active'));
  searchBar.addEventListener('mouseleave', () => {
    if (!searchInput.value) searchBar.classList.remove('active');
  });

  // debounce e escuta de input
  let dt;
  searchInput.addEventListener('input', () => {
    clearTimeout(dt);
    dt = setTimeout(() => {
      const q = searchInput.value.trim();
      if (q) updateSearch(filterSearch(q));
      else searchResults.style.display = 'none';
    }, 300);
  });

  // filtra resultados
  function filterSearch(q) {
    const all = [...filmes, ...series, ...animes];
    return all.filter(i => (i.nome || i.serie || i.anime)
      .toLowerCase()
      .includes(q.toLowerCase())
    );
  }

  // renderiza resultados
  function updateSearch(res) {
    searchResults.innerHTML = '';
    res.forEach(item => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.style.cssText = 'display:flex; align-items:center; margin-bottom:8px; cursor:pointer;';

      const img = document.createElement('img');
      img.src = item.cover || '/imagens/default_cover.jpg';
      img.style.cssText = 'width:50px; height:70px; margin-right:10px;';
      div.appendChild(img);

      const txt = document.createElement('span');
      txt.textContent = item.nome || item.serie || item.anime;
      div.appendChild(txt);

      div.addEventListener('click', () => {
        const isS = !!item.temporadas;
        const page = isS
          ? (item.serie ? 'serie.html' : 'anime.html')
          : 'filme.html';
        window.location.href = `${page}?id=${encodeURIComponent(item.id)}`;
      });

      searchResults.appendChild(div);
    });
    searchResults.style.display = res.length ? 'block' : 'none';
  }


  // === Lógica de Série / Anime ===
  const path        = window.location.pathname;
  const isAnimePage = path.endsWith('anime.html');
  const isSeriesPage= path.endsWith('serie.html');

  if (isAnimePage || isSeriesPage) {
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    if (!id) {
      alert('Conteúdo não informado.');
      return;
    }

    const catalog = isSeriesPage ? series : animes;
    const content = catalog.find(item => item.id === id);
    if (!content) {
      alert('Conteúdo não encontrado.');
      return;
    }

    // Título e capa
    const nameEl  = document.getElementById('movie-title');
    const coverEl = document.getElementById('movie-cover');
    const name    = content.serie || content.anime;
    nameEl.textContent = name;
    coverEl.src        = content.cover;
    coverEl.alt        = name;

    // Fundo
    const bg = document.querySelector('.background-container');
    let coverPath = content.cover.replace(/^\.\//, '/');
    if (!coverPath.startsWith('/')) coverPath = '/' + coverPath;
    bg.style.backgroundImage    = `url("${coverPath}")`;
    bg.style.backgroundRepeat   = 'no-repeat';
    bg.style.backgroundSize     = 'cover';
    bg.style.backgroundPosition = 'center';

    // Temporadas e episódios
    const listContainer = document.getElementById('episodes-list');
    const flatPaths     = [];
    let currentIndex    = -1;

    content.temporadas.forEach(season => {
      const box = document.createElement('div');
      box.className = 'season-box';

      const hdr = document.createElement('h3');
      hdr.className   = 'season-header';
      hdr.textContent = `Temporada ${season.season}`;
      box.appendChild(hdr);

      const epsDiv = document.createElement('div');
      epsDiv.className   = 'eps-container';
      epsDiv.style.display = 'none';

      season.episodes.forEach(ep => {
        flatPaths.push(ep.path);
        const wrapper = document.createElement('div');
        wrapper.className = 'episode';
        const a = document.createElement('a');
        a.href        = '#';
        a.textContent = `Episódio ${ep.episode}`;
        a.addEventListener('click', e => {
          e.preventDefault();
          playEpisode(ep.path);
        });
        wrapper.appendChild(a);
        epsDiv.appendChild(wrapper);
      });

      box.appendChild(epsDiv);
      listContainer.appendChild(box);

      hdr.addEventListener('click', () => {
        const open = epsDiv.style.display === 'block';
        document.querySelectorAll('.eps-container')
          .forEach(d => d.style.display = 'none');
        epsDiv.style.display = open ? 'none' : 'block';
      });
    });

    // Player Overlay
    const overlay   = document.getElementById('player-overlay');
    const playerSrc = document.getElementById('player-source');
    const video     = document.getElementById('episode-player');

    window.playEpisode = function(path) {
      currentIndex = flatPaths.indexOf(path);
      playerSrc.src = path;
      video.load();
      overlay.style.display = 'flex';
    };

    document.getElementById('close-player')
      .addEventListener('click', () => overlay.style.display = 'none');

    document.getElementById('next-episode')
      .addEventListener('click', () => {
        if (currentIndex < flatPaths.length - 1) {
          playEpisode(flatPaths[currentIndex + 1]);
        }
      });
  }
})();
