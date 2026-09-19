# PrimeVis — Método Ponto de Decisão

Landing page de conversão do Método Ponto de Decisão™, da PrimeVis.

## Estrutura

```
index.html                     landing page principal
politica-de-privacidade.html   página legal — Política de Privacidade
politica-de-cookies.html       página legal — Política de Cookies
termos-de-uso.html             página legal — Termos de Uso
assets/
  css/
    legal.css             tipografia das páginas legais
    tokens/               design tokens: cores, tipografia, espaçamento, forma, motion
                           (fontes não ficam mais aqui — ver "Performance" abaixo)
  js/
    legal-config.js       ÚNICO arquivo com os dados jurídicos (placeholders) — ver seção abaixo
    legal-fill.js          aplica legal-config.js nas 3 páginas legais, sem precisar editá-las
    capi-relay.js          envia PageView/Lead ao Worker da Conversions API — ver seção "Meta Pixel"
  img/
    logo-primevis.png, logo-primevis-128.webp        (a -128 é a servida nas páginas)
    hero-ponto-decisao.webp, hero-ponto-decisao-640.webp   (fonte + variante mobile)
    rodrigo.jpg, rodrigo.webp, rodrigo-480.webp             (fonte + variantes servidas)
    favicon-32.png, favicon-source-512.png, apple-touch-icon.png
cloudflare-worker/
  meta-capi-relay.js     código de referência do Worker (roda de verdade no painel do Cloudflare)
  README-capi.md          passo a passo de configuração — ver seção "Meta Pixel"
```

Tudo estático — sem framework, sem build, sem base de dados. As 4 páginas HTML são arquivos
independentes (não há roteamento server-side); os links entre elas são relativos.

Não há passo de build: `index.html` referencia CSS e imagens por caminho relativo e pode ser
publicado como está em qualquer host de arquivos estáticos (GitHub Pages, Vercel, Netlify, S3...).

## Rodar localmente

Qualquer servidor estático simples funciona, por exemplo:

```bash
python -m http.server 4173
```

Depois abra `http://localhost:4173`. Abrir `index.html` direto do disco (`file://`) também
funciona, mas um servidor evita eventuais restrições do navegador para caminhos relativos.

## Performance

Ajustado em 2026-09-19 pra tirar o score mobile do PageSpeed Insights de 72 pra 90+, sem alterar
conteúdo, texto ou estrutura visual. Pontos que valem saber se for mexer no `<head>` ou nas
imagens de novo:

- **Fontes do Google Fonts**: carregadas via `<link rel="stylesheet" media="print" onload="this.media='all'">`
  em vez de `@import` dentro de CSS — isso evita que o download da fonte bloqueie a primeira
  renderização. Tem `preconnect` pra `fonts.googleapis.com`/`fonts.gstatic.com`, e o `index.html`
  ainda tem um `<link rel="preload" as="font">` apontando direto pro arquivo woff2 do Outfit peso
  700 (usado no H1 do hero) — se o Google trocar a URL/hash desse arquivo no futuro, esse preload
  só para de ajudar (não quebra nada), vale reconferir a URL em `fonts.googleapis.com/css2?family=Outfit...`.
- **`assets/css/styles.css` e `assets/css/tokens/fonts.css` foram removidos**: o primeiro só
  re-importava (via `@import`) os mesmos 6 arquivos de tokens que o HTML já carregava direto —
  ou seja, cada página baixava e interpretava o CSS de tokens **duas vezes**, incluindo mais uma
  chamada redundante ao Google Fonts. O segundo virou desnecessário depois que o carregamento de
  fontes passou a ser feito direto no HTML (ponto acima).
  Não recrie esses arquivos sem checar se algo já carrega o mesmo CSS por outro caminho.
- **Imagens**: toda imagem em uso tem uma versão redimensionada pro tamanho real de exibição —
  nunca subir um arquivo grande e encolher só via CSS. `logo-primevis-128.webp` (128px) é a
  servida nas páginas porque a logo nunca aparece acima de 34px; os arquivos originais
  (`logo-primevis.png`, `rodrigo.jpg`) ficam no repo como fonte, mas nenhuma página os referencia
  mais. A imagem do hero (`hero-ponto-decisao.webp`) tem `fetchpriority="high"` e nenhum
  `loading="lazy"`, porque é o LCP da página; a foto do Rodrigo (`rodrigo.webp`), abaixo da
  dobra, tem `loading="lazy"`. Ambas usam `srcset`/`sizes` com uma variante menor pra mobile.
- **Cache HTTP de ativos estáticos**: não configurado. O site é servido pelo GitHub Pages, que
  não tem um arquivo de config de headers (tipo `_headers` da Netlify/Cloudflare Pages), e o
  proxy do Cloudflare está deliberadamente desligado (`Somente DNS`) no CNAME de `lp` pra manter
  o certificado do GitHub Pages funcionando — então não há hoje um ponto de controle pra
  sobrescrever `Cache-Control`. Se isso vier a incomodar visitante recorrente, a opção é reativar
  o proxy do Cloudflare nesse subdomínio (com os cuidados de SSL já documentados em
  `cloudflare-worker/README-capi.md`) e usar Page Rules/Cache Rules de lá.

## Meta Pixel

O Pixel (`692402367298918`) está no `<head>` de **todas as 4 páginas** (`index.html` e as 3
páginas legais) e dispara `PageView` automaticamente no carregamento. Os três botões de CTA de
`index.html` (Hero, bloco "Padrão que sustenta o método" e CTA final) disparam o evento `Lead`
no clique, todos com a guarda `typeof window.fbq === 'function'` para não quebrar a página caso
o Pixel não carregue (bloqueadores de anúncio, falha de rede, etc.).

Além do Pixel do navegador, `assets/js/capi-relay.js` envia o mesmo PageView/Lead (com o mesmo
`event_id`, para a Meta deduplicar) para um Cloudflare Worker em `capi.primevis.com.br`, que
retransmite à Meta Conversions API server-side. O site continua 100% estático — o Worker é a
única peça de servidor, e o token de acesso da API fica guardado como secret só dentro do
Cloudflare, nunca neste repositório. Ver **[`cloudflare-worker/README-capi.md`](cloudflare-worker/README-capi.md)**
para o setup completo.

## Páginas legais

O rodapé de todas as páginas linka para três páginas legais (Política de Privacidade, Política
de Cookies e Termos de Uso). A transparência sobre o uso do Meta Pixel fica documentada na
Política de Privacidade — não há mais um banner fixo na tela avisando sobre isso.

### Substituindo os dados jurídicos (placeholders)

Todo texto jurídico usa placeholders entre colchetes (`[NOME EMPRESARIAL...]`, `[CNPJ...]`
etc.). Eles têm **uma única fonte**: edite apenas
**[`assets/js/legal-config.js`](assets/js/legal-config.js)** — as três páginas legais puxam os
valores de lá automaticamente (via `legal-fill.js`), não precisa editar o HTML de cada uma.
Campos a preencher:

| Placeholder | O que é |
| --- | --- |
| `controladorNome` | Razão social ou nome do responsável pelo site |
| `controladorDoc` | CNPJ ou CPF |
| `emailPrivacidade` | E-mail de contato para assuntos de privacidade — vira link `mailto:` automaticamente |
| `endereco` | Endereço ou cidade/UF (usado também para o foro nos Termos de Uso) |
| `dominio` | Domínio oficial de produção (ex.: `lp.primevis.com.br`) |
| `ultimaAtualizacao` | Data da última revisão do texto legal |

### ⚠️ Revisão jurídica obrigatória antes de publicar em definitivo

O texto das três páginas legais foi escrito sem assessoria jurídica e **não é garantia de
conformidade legal**. Antes de publicar em definitivo, um advogado precisa revisar especialmente:

- A **base legal do Meta Pixel** (hoje descrita como legítimo interesse, art. 7º, IX da LGPD,
  com carregamento automático e sem bloqueio prévio) — pode ser necessário migrar para
  consentimento prévio via gerenciador de cookies, dependendo da análise de risco;
- Os placeholders jurídicos da tabela acima, preenchidos com os dados reais da empresa;
- O foro eleito nos Termos de Uso (`endereco`), e a razão social usada em todo o texto.

## Origem

O conteúdo e o sistema visual vieram de um projeto no Claude Design (`Método Ponto de Decisão`).
A página foi reconstruída aqui como HTML/CSS estático — sem o runtime de edição ao vivo do
Claude Design (React/Babel via CDN) — para ter carregamento rápido, bom SEO e nenhuma
dependência externa de runtime em produção.
