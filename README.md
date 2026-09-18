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
    styles.css           agrega os tokens de design (@import)
    legal.css             banner de aviso + tipografia das páginas legais
    tokens/               design tokens: cores, tipografia, espaçamento, forma, motion, fontes
  js/
    legal-config.js       ÚNICO arquivo com os dados jurídicos (placeholders) — ver seção abaixo
    legal-fill.js          aplica legal-config.js nas 3 páginas legais, sem precisar editá-las
  img/
    logo-primevis.png
    hero-ponto-decisao.webp
    rodrigo.jpg
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

## Meta Pixel

O Pixel (`692402367298918`) está no `<head>` de **todas as 4 páginas** (`index.html` e as 3
páginas legais) e dispara `PageView` automaticamente no carregamento. Os três botões de CTA de
`index.html` (Hero, bloco "Padrão que sustenta o método" e CTA final) disparam o evento `Lead`
no clique, todos com a guarda `typeof window.fbq === 'function'` para não quebrar a página caso
o Pixel não carregue (bloqueadores de anúncio, falha de rede, etc.).

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
