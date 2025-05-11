import os
import json
import uuid

# Diretórios de entrada e saída
MOVIES_DIR = './filmes'
COVERS_DIR = './capas'
SERIES_DIR = './series'
ANIMES_DIR = './animes'

OUTPUT_MOVIES = 'json/filmes.json'
OUTPUT_SERIES = 'json/series.json'
OUTPUT_ANIMES = 'json/animes.json'

# Extensões de vídeo válidas
VIDEO_EXTENSIONS = ('.mp4', '.mkv', '.avi')


def generate_id():
    """Gera um ID único para cada item."""
    return str(uuid.uuid4())


def extract_number(name):
    """Extrai o primeiro número encontrado em uma string para ordenação."""
    import re
    m = re.search(r"(\d+)", name)
    return int(m.group(1)) if m else 0


def scan_movies():
    """Escaneia filmes e gera JSON."""
    movies = []
    for fname in sorted(os.listdir(MOVIES_DIR), key=extract_number):
        if fname.lower().endswith(VIDEO_EXTENSIONS):
            name = os.path.splitext(fname)[0]
            path = os.path.join(MOVIES_DIR, fname).replace('\\', '/')
            cover_name = name + '.jpg'
            cover_path = os.path.join(COVERS_DIR, cover_name).replace('\\', '/')
            cover = cover_path if os.path.exists(cover_path) else ''
            movies.append({
                'id': generate_id(),
                'nome': name,
                'path': path,
                'cover': cover
            })
    os.makedirs(os.path.dirname(OUTPUT_MOVIES), exist_ok=True)
    with open(OUTPUT_MOVIES, 'w', encoding='utf-8') as f:
        json.dump(movies, f, indent=4, ensure_ascii=False)
    print(f"Gerado {OUTPUT_MOVIES} com {len(movies)} filmes.")


def scan_catalog(root_dir, output_file, key_name):
    """Escaneia séries ou animes, gerando JSON com temporadas."""
    catalog = []
    for series_name in sorted(os.listdir(root_dir)):
        series_path = os.path.join(root_dir, series_name)
        if not os.path.isdir(series_path):
            continue
        # Cover opcional
        cover_name = series_name + '.jpg'
        cover_path = os.path.join(COVERS_DIR, cover_name).replace('\\', '/')
        cover = cover_path if os.path.exists(cover_path) else ''

        seasons = []
        for season_folder in sorted(os.listdir(series_path), key=extract_number):
            season_path = os.path.join(series_path, season_folder)
            if not os.path.isdir(season_path):
                continue
            season_number = extract_number(season_folder)
            episodes = []
            for ep_fname in sorted(os.listdir(season_path), key=extract_number):
                if ep_fname.lower().endswith(VIDEO_EXTENSIONS):
                    ep_number = extract_number(ep_fname)
                    ep_path = os.path.join(season_path, ep_fname).replace('\\', '/')
                    episodes.append({
                        'id': generate_id(),
                        'episode': ep_number,
                        'path': ep_path
                    })
            seasons.append({
                'season': season_number,
                'episodes': episodes
            })

        catalog.append({
            'id': generate_id(),
            key_name: series_name,
            'cover': cover,
            'temporadas': seasons
        })
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=4, ensure_ascii=False)
    print(f"Gerado {output_file} com {len(catalog)} itens.")


if __name__ == '__main__':
    scan_movies()
    scan_catalog(SERIES_DIR, OUTPUT_SERIES, 'serie')
    scan_catalog(ANIMES_DIR, OUTPUT_ANIMES, 'anime')