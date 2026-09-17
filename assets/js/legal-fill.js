// Preenche todo elemento com data-legal="<chave>" usando window.PV_LEGAL
// (definido em legal-config.js). Se o JS não rodar por algum motivo, o
// placeholder entre colchetes já escrito no HTML continua visível — não
// há perda de informação, só falta a substituição automática.
(function () {
  if (!window.PV_LEGAL) return;
  document.querySelectorAll('[data-legal]').forEach(function (el) {
    var key = el.getAttribute('data-legal');
    var value = window.PV_LEGAL[key];
    if (typeof value !== 'string') return;
    el.textContent = value;
    // Link de e-mail: só vira mailto: de verdade depois que o placeholder
    // for substituído por um endereço real em legal-config.js.
    if (key === 'emailPrivacidade' && el.tagName === 'A' && value.indexOf('[') !== 0) {
      el.href = 'mailto:' + value;
    }
  });
})();
