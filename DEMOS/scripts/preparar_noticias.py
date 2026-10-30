
from pathlib import Path
import json
import os
import urllib.parse
import urllib.request

pasta = Path(__file__).resolve().parent.parent

chave = os.environ.get("GNEWS_API_KEY")

if not chave:
    raise ValueError("Chave GNEWS_API_KEY não configurada.")

parametros = urllib.parse.urlencode({
    "q": "política OR eleições OR congresso",
    "lang": "pt",
    "country": "br",
    "max": 6,
    "apikey": chave
})

url = "https://gnews.io/api/v4/search?" + parametros

req = urllib.request.Request(
    url,
    headers={"User-Agent": "DEMOS-Projeto-Academico"}
)

with urllib.request.urlopen(req, timeout=20) as resposta:
    dados = json.load(resposta)

noticias = []

for artigo in dados.get("articles", []):
    noticias.append({
        "titulo": artigo.get("title"),
        "descricao": artigo.get("description"),
        "imagem": artigo.get("image"),
        "link": artigo.get("url"),
        "data": artigo.get("publishedAt"),
        "fonte": artigo.get("source", {}).get("name")
    })

saida = pasta / "dados" / "noticias.json"

saida.write_text(
    json.dumps(noticias, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print("Notícias salvas:", len(noticias))
print("Arquivo:", saida)
