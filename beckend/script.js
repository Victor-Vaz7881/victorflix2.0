// Aguarda o DOM pronto
document.addEventListener('DOMContentLoaded', async () => {
  // 0) Verifica sessão (páginas públicas)
  const publicPages = ['login.html','cadastro.html','esqueci-senha.html'];
  const page = window.location.pathname.split('/').pop();
  if (!publicPages.includes(page)) {
    const user = JSON.parse(localStorage.getItem('victorflixUser'));
    if (!user || user.lastLoginDate !== new Date().toLocaleDateString()) {
      return window.location.href = 'login.html';
    }
  }

  // Elementos fixos
  const slidersContainer = document.getElementById('sliders-container');
  const searchIcon    = document.getElementById('search-icon');
  const searchBar     = document.getElementById('search-bar');
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const logoutBtn     = document.getElementById('botaosair');

  // Logout
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('victorflixUser');
    window.location.href = 'login.html';
  });

  // 1) Carrega e mistura todos os catálogos
  let all = [];
  try {
    const [fRes, sRes, aRes] = await Promise.all([
      fetch('/json/filmes.json'),
      fetch('/json/series.json'),
      fetch('/json/animes.json')
    ]);
    const filmes  = await fRes.json();
    const series  = await sRes.json();
    const animes  = await aRes.json();
    all = [...filmes, ...series, ...animes];
  } catch (e) {
    console.error('Erro ao carregar catálogo:', e);
    return alert('Falha ao carregar conteúdo.');
  }

  // 2) Gera 5 sessões de 15 itens únicos cada
  const SESSIONS = 5, PER_SESSION = 15;
  for (let i = 0; i < SESSIONS; i++) {
    // shuffle cópia do catálogo
    const pool = all.slice();
    for (let j = pool.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [pool[j], pool[k]] = [pool[k], pool[j]];
    }
    const slice = pool.slice(0, PER_SESSION);

    // monta a seção
    const sec = document.createElement('section');
    sec.className = 'movie-slider-container';

    const title = document.createElement('h2');
    title.className = 'slider-title';
    // title.textContent = `Sessão ${i + 1}`;
    sec.appendChild(title);

    const btnL = document.createElement('button');
    btnL.className = 'scroll-button left';
    btnL.innerHTML = '&#8249;';
    const slider = document.createElement('div');
    slider.className = 'movie-slider';

    const btnR = document.createElement('button');
    btnR.className = 'scroll-button right';
    btnR.innerHTML = '&#8250;';

    // popula 15 cards únicos
    slice.forEach(item => {
      const card = document.createElement('div');
      card.className = 'movie';
      const img = document.createElement('img');
      img.src = item.cover || '/imagens/default_cover.jpg';
      img.alt = item.nome || item.serie || item.anime;
      card.appendChild(img);
      card.addEventListener('click', () => {
        const isSeries = !!item.temporadas;
        let params, page;
        if (isSeries) {
          params = { id: encodeURIComponent(item.id) };
          page = item.serie ? 'serie.html' : 'anime.html';
        } else {
          params = {
            nome:  encodeURIComponent(item.nome),
            path:  encodeURIComponent(item.path),
            cover: encodeURIComponent(item.cover)
          };
          page = 'filme.html';
        }
        window.location.href = `${page}?${new URLSearchParams(params)}`;
      });
      slider.appendChild(card);
    });

    // scroll
    btnL.addEventListener('click', () => slider.scrollBy({ left: -300, behavior: 'smooth' }));
    btnR.addEventListener('click', () => slider.scrollBy({ left:  300, behavior: 'smooth' }));

    // adiciona ao DOM
    sec.appendChild(btnL);
    sec.appendChild(slider);
    sec.appendChild(btnR);
    slidersContainer.appendChild(sec);
  }

  // 3) Pesquisa com debounce
  searchIcon.addEventListener('mouseover', () => searchBar.classList.add('active'));
  searchInput.addEventListener('focus', () => searchBar.classList.add('active'));
  searchBar.addEventListener('mouseleave', () => {
    if (!searchInput.value.trim()) {
      searchBar.classList.remove('active');
      searchResults.style.display = 'none';
    }
  });

  let timer;
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = searchInput.value.trim().toLowerCase();
      if (q) {
        const filtered = all.filter(item => {
          const t = (item.nome||item.serie||item.anime||'').toLowerCase();
          return t.includes(q);
        });
        updateSearch(filtered);
      } else {
        searchResults.style.display = 'none';
      }
    }, 300);
  });

  function updateSearch(results) {
    searchResults.innerHTML = '';
    results.forEach(r => {
      const d = document.createElement('div');
      d.className = 'search-result-item';
      const i = document.createElement('img');
      i.src = r.cover || '/imagens/default_cover.jpg';
      d.appendChild(i);
      const s = document.createElement('span');
      s.textContent = r.nome || r.serie || r.anime;
      d.appendChild(s);
      d.addEventListener('click', () => {
        const isS = !!r.temporadas;
        const p = isS
          ? { id: encodeURIComponent(r.id) }
          : {
              nome:  encodeURIComponent(r.nome),
              path:  encodeURIComponent(r.path),
              cover: encodeURIComponent(r.cover)
            };
        const pg = isS ? (r.serie?'serie.html':'anime.html') : 'filme.html';
        window.location.href = `${pg}?${new URLSearchParams(p)}`;
      });
      searchResults.appendChild(d);
    });
    searchResults.style.display = results.length ? 'block':'none';
  }
});
