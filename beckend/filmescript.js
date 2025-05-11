// Navbar & pesquisa
const searchIcon   = document.getElementById('search-icon');
const searchBar    = document.getElementById('search-bar');
const searchInput  = document.getElementById('search-input');
const searchResults= document.getElementById('search-results');
let filmes  = [], series = [], animes = [];

// Busca JSONs
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
  } catch(e) {
    console.error('Erro ao carregar catálogo:', e);
  }
}
fetchCatalogData();

// pesquisa hover/focus
searchIcon.addEventListener('mouseover',()=> searchBar.classList.add('active'));
searchBar.addEventListener('mouseleave',()=> {
  if(!searchInput.value) searchBar.classList.remove('active');
});

// filtra e mostra resultados
function filterSearch(q) {
  const all = [...filmes, ...series, ...animes];
  return all.filter(i=>(i.nome||i.serie||i.anime).toLowerCase().includes(q.toLowerCase()));
}
function updateSearch(r) {
  searchResults.innerHTML = '';
  r.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.style.display='flex';div.style.alignItems='center';div.style.marginBottom='8px';div.style.cursor='pointer';
    const img = document.createElement('img');
    img.src = item.cover||'/imagens/default_cover.jpg';img.style.width='50px';img.style.height='70px';img.style.marginRight='10px';
    div.appendChild(img);
    const txt = document.createElement('span');
    txt.textContent = item.nome||item.serie||item.anime;div.appendChild(txt);
    div.addEventListener('click',()=>{
      const isS = !!item.temporadas;
      const p = isS? {
        serie:      encodeURIComponent(item.serie||item.anime),
        cover:      encodeURIComponent(item.cover),
        temporadas: encodeURIComponent(btoa(JSON.stringify(item.temporadas)))
      } : {
        nome:  encodeURIComponent(item.nome),
        path:  encodeURIComponent(item.path),
        cover: encodeURIComponent(item.cover)
      };
      window.location.href = `${isS?'serie.html':'filme.html'}?${new URLSearchParams(p)}`;
    });
    searchResults.appendChild(div);
  });
  searchResults.style.display = r.length?'block':'none';
}
let dt;
searchInput.addEventListener('input',()=>{
  clearTimeout(dt);
  dt = setTimeout(()=>{
    const q = searchInput.value.trim();
    if(q) updateSearch(filterSearch(q));
    else searchResults.style.display='none';
  },300);
});

// pegar params
const urlParams = new URLSearchParams(window.location.search);
const nome  = decodeURIComponent(urlParams.get('nome')  || '');
const path  = decodeURIComponent(urlParams.get('path')  || '');
const cover = decodeURIComponent(urlParams.get('cover') || '');

// elementos
const titleEl = document.getElementById('movie-title');
const coverEl = document.getElementById('movie-cover');
const bg      = document.querySelector('.background-container');
const srcEl   = document.getElementById('movie-source');
const player  = document.getElementById('movie-player');

if (nome)  titleEl.textContent = nome;
if (cover) {
  coverEl.src = cover;
  // decodificado, agora funciona como background
  bg.style.backgroundImage = `url("${cover}")`;
}
if (path) {
  srcEl.src = path;
  player.load();
}


// botões
document.getElementById('replay-btn').addEventListener('click',()=>{
  player.currentTime = 0; player.play();
});
document.getElementById('back-btn').addEventListener('click',()=>{
  window.history.back();
});
document.getElementById('logo-flix').addEventListener('click',()=>{
  window.location.href='index.html';
});
