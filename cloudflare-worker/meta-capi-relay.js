// Cloudflare Worker — retransmite PageView/Lead do site pra Meta Conversions API.
//
// Este arquivo é só referência versionada; o código que roda de verdade fica
// colado direto no editor do Cloudflare Workers (ver README-capi.md pro
// passo a passo). O token de acesso (META_CAPI_TOKEN) NUNCA fica neste
// arquivo nem em nenhum outro lugar do repositório — é configurado como
// "secret" dentro do próprio Worker, no painel do Cloudflare.
//
// Espera receber, via POST, o mesmo event_id usado no Pixel do navegador
// (assets/js/capi-relay.js), pra Meta deduplicar as duas versões do evento.

const PIXEL_ID = '692402367298918';
const ALLOWED_ORIGINS = [
  'https://lp.primevis.com.br'
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
    }

    const { event_name, event_id, event_source_url, fbp, fbc } = body || {};
    if (!event_name || !event_id || !event_source_url) {
      return new Response('Missing fields', { status: 400, headers: corsHeaders });
    }
    if (event_name !== 'PageView' && event_name !== 'Lead') {
      return new Response('Unsupported event', { status: 400, headers: corsHeaders });
    }

    const userData = {
      client_ip_address: request.headers.get('CF-Connecting-IP') || undefined,
      client_user_agent: request.headers.get('User-Agent') || undefined
    };
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const payload = {
      data: [{
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        event_source_url,
        action_source: 'website',
        user_data: userData
      }]
    };

    const metaRes = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${env.META_CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const metaJson = await metaRes.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: metaRes.ok, meta: metaJson }), {
      status: metaRes.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
