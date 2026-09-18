// Envia PageView/Lead em paralelo ao Pixel do navegador para o Cloudflare
// Worker que retransmite à Meta Conversions API (server-side). Usa o mesmo
// event_id no Pixel e na API para a Meta deduplicar as duas versões do
// mesmo evento — ver assets/js/README-capi.md para o desenho completo.
window.PV_CAPI = (function () {
  var ENDPOINT = 'https://capi.primevis.com.br/events';

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
  }

  function genId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function send(eventName, eventId) {
    try {
      var payload = JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc')
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      }
    } catch (e) {}
  }

  return { genId: genId, send: send };
})();
