(function () {
  var enlaces = [
    { href: "modulos/catalogo/index.html", label: "Catálogo" },
    { href: "modulos/recetario/index.html", label: "Recetario" },
    { href: "modulos/despensa/index.html", label: "Despensa" },
    { href: "modulos/nutricion/index.html", label: "Nutrición" },
    { href: "modulos/planificador/index.html", label: "Planificador" },
    { href: "modulos/comunidad/index.html", label: "Comunidad" },
    { href: "modulos/mercadeo/index.html", label: "Mercadeo" }
  ];

  function esPaginaModulo() {
    return window.location.pathname.toLowerCase().indexOf("/modulos/") !== -1;
  }

  function prefijo() {
    return esPaginaModulo() ? "../../" : "";
  }

  function pintarHeader() {
    var header = document.querySelector('[data-layout="header"]');
    if (!header) {
      return;
    }

    var base = prefijo();
    var actual = window.location.pathname.toLowerCase();

    var navLinks = enlaces.map(function (enlace) {
      var destino = base + enlace.href;
      var destinoPath = new URL(destino, window.location.href).pathname.toLowerCase();
      var activo = destinoPath === actual ? "activo" : "";
      return '<a class="' + activo + '" href="' + destino + '">' + enlace.label + "</a>";
    }).join("");

    header.innerHTML =
      '<div class="topbar">' +
      '  <div class="contenedor topbar-interno">' +
      '    <a class="marca" href="' + base + 'index.html">Sazón</a>' +
      '    <nav class="navegacion" aria-label="Módulos">' + navLinks + "</nav>" +
      '    <div class="acciones">' +
      '      <a class="btn btn-secundario" href="' + base + 'modulos/usuarios/index.html#login">Iniciar sesión</a>' +
      '      <a class="btn btn-primario" href="' + base + 'modulos/usuarios/index.html#registro">Regístrese</a>' +
      "    </div>" +
      "  </div>" +
      "</div>";
  }

  function pintarFooter() {
    var footer = document.querySelector('[data-layout="footer"]');
    if (!footer) {
      return;
    }

    var year = new Date().getFullYear();
    footer.className = "site-footer";
    footer.innerHTML = '<div class="contenedor">Proyecto Sazón · Front I · ' + year + "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    pintarHeader();
    pintarFooter();
  });
})();
