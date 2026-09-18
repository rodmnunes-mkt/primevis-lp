# Meta Conversions API via Cloudflare Worker

O site (`primevis-lp`) é estático — não tem servidor. O Worker abaixo é o
"servidor" mínimo que faltava: recebe PageView/Lead do navegador e retransmite
pra Meta Conversions API usando o token de acesso, que fica guardado como
secret só dentro do Cloudflare — nunca no código do site nem neste repositório.

Isso não afeta o Pixel do navegador (`fbevents.js`), que continua rodando
normalmente. Os dois passam a enviar o mesmo evento (mesmo `event_id`) e a
Meta deduplica automaticamente — é o setup recomendado pela própria Meta
("Pixel + CAPI em paralelo").

## O que já está pronto no código

- `assets/js/capi-relay.js` — roda no navegador, gera o `event_id` e envia o
  evento pro Worker via `navigator.sendBeacon`.
- `index.html` e as 3 páginas legais já chamam `window.PV_CAPI.send(...)` no
  PageView; `index.html` chama também no clique dos 3 CTAs de WhatsApp (Lead).
- `cloudflare-worker/meta-capi-relay.js` — código de referência do Worker
  (é o que você cola no editor do Cloudflare no passo 2 abaixo).

## O que só você pode fazer (não tenho acesso à sua conta Cloudflare/Meta)

### 1. Gerar um novo token de acesso da Conversions API

No Gerenciador de Eventos → seu Pixel (`692402367298918`) → Configurações →
Conversions API → "Gerar token de acesso". **Não me envie esse token pelo
chat** — cole direto no Cloudflare no passo 3.

### 2. Criar o Worker no Cloudflare

1. Painel do Cloudflare → **Workers & Pages** → **Create** → **Create Worker**
2. Dá um nome (ex.: `primevis-capi-relay`) → **Deploy** (ele cria um worker vazio primeiro)
3. Depois de criado, clica em **Edit code** e substitui todo o conteúdo pelo
   código de `cloudflare-worker/meta-capi-relay.js` deste repositório → **Deploy**

### 3. Guardar o token como secret (nunca como variável comum)

No Worker → **Settings** → **Variables and Secrets** → **Add** →
- Type: **Secret**
- Name: `META_CAPI_TOKEN`
- Value: o token gerado no passo 1
→ Save and deploy

### 4. Apontar `capi.primevis.com.br` pro Worker

No Worker → **Settings** → **Domains & Routes** → **Add** → **Custom Domain**
→ digita `capi.primevis.com.br` → Cloudflare cria o DNS e o certificado
automaticamente (o domínio já está no Cloudflare, então isso é só alguns
cliques, sem precisar mexer na aba DNS manualmente).

### 5. Testar

Depois de propagar (geralmente rápido, minutos):

```bash
curl -i -X POST https://capi.primevis.com.br/events \
  -H "Content-Type: application/json" \
  -H "Origin: https://lp.primevis.com.br" \
  -d '{"event_name":"PageView","event_id":"teste-manual-1","event_source_url":"https://lp.primevis.com.br/"}'
```

Deve voltar `{"ok":true,...}`. Depois confirma no Gerenciador de Eventos →
"Testar eventos" que o evento chegou marcado com a origem **"Servidor"** (além
do que já chega do navegador).

Me chama quando terminar os passos 1-4 que eu confirmo o teste com você.
