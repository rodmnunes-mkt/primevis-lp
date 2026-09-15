# PrimeVis — Método Ponto de Decisão

Landing page de conversão do Método Ponto de Decisão™, da PrimeVis.

## Estrutura

```
index.html              página única, HTML/CSS estático (sem framework/build)
assets/
  css/
    styles.css           agrega os tokens de design (@import)
    tokens/               design tokens: cores, tipografia, espaçamento, forma, motion, fontes
  img/
    logo-primevis.png
    hero-ponto-decisao.webp
    rodrigo.jpg
```

Não há passo de build: `index.html` referencia CSS e imagens por caminho relativo e pode ser
publicado como está em qualquer host de arquivos estáticos (GitHub Pages, Vercel, Netlify, S3...).

## Rodar localmente

Qualquer servidor estático simples funciona, por exemplo:

```bash
python -m http.server 4173
```

Depois abra `http://localhost:4173`. Abrir `index.html` direto do disco (`file://`) também
funciona, mas um servidor evita eventuais restrições do navegador para caminhos relativos.

## Meta Pixel

O Pixel (`692402367298918`) está no `<head>` de `index.html` e dispara `PageView`
automaticamente no carregamento. Os três botões de CTA (Hero, bloco "Padrão que sustenta o
método" e CTA final) disparam o evento `Lead` no clique, todos com a guarda
`typeof window.fbq === 'function'` para não quebrar a página caso o Pixel não carregue
(bloqueadores de anúncio, falha de rede, etc.).

## Origem

O conteúdo e o sistema visual vieram de um projeto no Claude Design (`Método Ponto de Decisão`).
A página foi reconstruída aqui como HTML/CSS estático — sem o runtime de edição ao vivo do
Claude Design (React/Babel via CDN) — para ter carregamento rápido, bom SEO e nenhuma
dependência externa de runtime em produção.
