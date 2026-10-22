# Elonai — blog + biblioteca de devocionais grátis

Site em Next.js 16 + Tailwind 4. Visual editorial (creme, tinta e dourado da logo), em inglês para o público americano.

## Rodar no computador

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # confere se está tudo certo antes de publicar
```

## Onde fica cada coisa

| O quê | Onde |
|---|---|
| Links (doação, grupo do Facebook, site, e-mail, redes) | `src/content/site.json` (também usado nos QR codes dos PDFs) |
| Catálogo de livros (grátis e "em breve") | `src/content/books.json` |
| Posts do blog | `src/content/posts/*.md` |
| Capas, PDFs e páginas de amostra | `public/books/<slug>/` (gerados pelos scripts em `../build`) |
| Fotos do site e do blog | `public/images/` |
| API dos formulários | `src/app/api/subscribe/route.ts` |
| Tabela do Supabase | `supabase/schema.sql` |

## Publicar um post novo

Crie `src/content/posts/meu-post.md`:

```md
---
title: "Título do post"
excerpt: "Uma ou duas frases que aparecem no card e no Google."
date: "2026-11-02"
category: "Prayer"
image: "post-prayer-journal"     # nome do arquivo em public/images, sem .jpg
book: "breathe"                  # (opcional) livro recomendado no fim do post
---

Texto em Markdown…
```

## Lançar um livro novo

1. Escreva o conteúdo em `../build/content_<slug>.py` (mesmo formato do `content_breathe.py`) e adicione o slug em `MODULES` no `book.py`.
2. Gere a arte da capa e das semanas em `../build/ai_images.py` (`python ai_images.py`).
3. `python book.py <slug>` → PDF em `../produto/` (o script avisa se alguma página estourar; rode também `python check_layout.py <slug>`).
4. Em `src/content/books.json`, mude o livro para `"status": "free"` e preencha `pdf`, `pages`, `weeks` e `inside`.
5. `python export_web.py` copia capa, PDF e páginas de amostra para `public/`.

## Ligar o Supabase

1. Crie um projeto em supabase.com e rode `supabase/schema.sql` no SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (Settings → API).
3. Na Vercel, adicione as mesmas duas variáveis em Settings → Environment Variables.

Sem essas variáveis o site funciona normalmente: os cadastros apenas aparecem no log do servidor.

## Publicar (Vercel, grátis)

Suba a pasta `web/` para um repositório no GitHub → vercel.com → *Add New Project* → escolha o repositório. Depois, atualize `site_url` em `src/content/site.json` com o endereço final.

## Painel admin (/admin)

1. Crie sua senha (mínimo 12 caracteres) e o código 2FA:
   `npm run admin:setup -- "sua senha longa aqui"`
   Isso grava as chaves em `.env.local` e cria `admin-2fa-qr.html`: abra, escaneie com Google Authenticator/Authy e **apague o arquivo**.
2. Reinicie o `npm run dev` e entre em `/admin`.
3. No Netlify/Vercel, copie as mesmas variáveis de `.env.local` (ADMIN_*, ANALYTICS_SALT, DONATION_LINKS_SHA256) em Environment variables.

O que o painel mostra:
- **Funil de conversão**: visitou → abriu a página de um livro → abriu o formulário → cadastrou → baixou o PDF.
- **Conversão por origem e por campanha**: quais redes e links trazem gente que baixa, não só cliques.
- **Desempenho por livro**, **pesquisa com leitores** (3 perguntas opcionais no formulário; as opções ficam em `src/lib/survey.ts`) e **leitura das páginas** (tempo típico e quantos leram até o fim).
- **Gerador de links rastreados** (UTM): use sempre esses links ao divulgar.
- Localização (país/estado/cidade) só aparece com o site publicado. Acessos em localhost e na rede local não são contados.

Proteções: senha com scrypt, código 2FA de uso único, bloqueio após 5 tentativas erradas (15 min), sessão de 8h em cookie seguro, admin fora do Google.

## Google Search Console e Bing (grátis)

Mostram o que as pessoas pesquisaram no Google/Bing antes de chegar ao blog.
1. search.google.com/search-console → *Adicionar propriedade* → *Prefixo do URL* (endereço do site) → método **Tag HTML**.
2. Copie só o código de dentro de `content="…"` e coloque em `GOOGLE_SITE_VERIFICATION` na Vercel/Netlify. Publique de novo (a tag entra no build) e clique em *Verificar*.
3. Em *Sitemaps*, envie `sitemap.xml`.
4. Bing Webmaster Tools: pode importar direto do Search Console, ou usar a tag em `BING_SITE_VERIFICATION`.

## Links de doação

Ficam em `src/content/site.json` → `donation_methods` (pode ter vários: Ko-fi, PayPal, Cash App…). Só aceita provedores aprovados (lista em `src/lib/donation.ts`).
Ao trocar um link: rode `npm run admin:setup` de novo (atualiza `DONATION_LINKS_SHA256`) ou atualize essa variável na hospedagem — se o link mudar sem ela, o site **não publica**. Depois gere os PDFs de novo: `python book.py` e `python export_web.py` na pasta `build`.

## Conferir versículos

Depois de editar qualquer livro: `python check_verses.py` (pasta `build`) compara cada citação com a KJV.
