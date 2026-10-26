/*
- admin-planificador.js
- HU-CEL05-01 [ADMIN]: Resumen Estadístico de Planes de Menú
 */

const API_URL = 'https://6adfa4d38e42963c8d5e4081.mockapi.io/api/v1/planesMenu';

const CLAVE_PLANES = 'planesMenu';
const COMIDAS_POR_PLAN = 28;
const META_MACROS = { proteinas: 30, carbohidratos: 50, grasas: 20 };
const TOLERANCIA_MACROS = 5;
const UMBRAL_OPTIMO = 70;
const ESTADOS = ['activo', 'borrador', 'archivado'];
const ETIQUETA_ESTADO = { activo: 'Activo', borrador: 'Borrador', archivado: 'Archivado' };
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

let todosLosPlanes = [];

const el = id => document.getElementById(id);

function escribir(id, texto) {
  const nodo = el(id);
  if (nodo) nodo.textContent = texto;
  else console.warn(`Falta #${id} en el HTML`);
}

const numero = valor => Number(valor) || 0;
const pct = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);
const esc = texto => String(texto ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
);

const dia = iso => {
  const f = new Date(iso + 'T00:00:00');
  return `${String(f.getDate()).padStart(2, '0')} ${MESES[f.getMonth()]}`;
};
const rango = (inicio, fin) =>
  `${dia(inicio)} - ${dia(fin)}, ${new Date(fin + 'T00:00:00').getFullYear()}`;

async function leerPlanes() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error('Error al conectar con MockAPI');
    const datos = await respuesta.json();
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("Error obteniendo los planes desde MockAPI:", error);
    return [];
  }
}

function esEquilibrado(macros) {
  const m = macros ?? {};
  return Object.keys(META_MACROS).every(clave =>
    Math.abs(numero(m[clave]) - META_MACROS[clave]) <= TOLERANCIA_MACROS
  );
}

function calcularMetricas(lista) {
  const total = lista.length;
  const conteo = { activo: 0, borrador: 0, archivado: 0 };
  const minutosPorIngrediente = {};
  let comidas = 0;
  let equilibrados = 0;

  lista.forEach(plan => {
    if (ESTADOS.includes(plan.estado)) conteo[plan.estado]++;
    comidas += numero(plan.comidasAsignadas);
    if (esEquilibrado(plan.macros)) equilibrados++;

    (plan.ingredientes ?? []).forEach(({ nombre, minutos }) => {
      minutosPorIngrediente[nombre] = (minutosPorIngrediente[nombre] ?? 0) + numero(minutos);
    });
  });

  const [nombreTop, minutosTop] =
    Object.entries(minutosPorIngrediente).sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];

  return {
    total,
    conteo,
    promedioComidas: total ? comidas / total : 0,
    ingredienteTop: { nombre: nombreTop, minutos: minutosTop },
    porcentajeEquilibrio: pct(equilibrados, total),
  };
}

function pintarKpis(m) {
  escribir('kpi-total-planes', m.total.toLocaleString('en-US'));
  escribir('kpi-promedio-comidas', m.promedioComidas.toFixed(1));
  escribir('kpi-ingrediente-top', m.ingredienteTop.nombre);
  escribir('kpi-ingrediente-minutos',
    `${m.ingredienteTop.minutos.toLocaleString('en-US')} minutos preparadas`);
  escribir('kpi-equilibrio', `${m.porcentajeEquilibrio}%`);
  escribir('kpi-equilibrio-etiqueta',
    m.porcentajeEquilibrio >= UMBRAL_OPTIMO ? 'Óptimo' : 'Mejorable');
}

function pintarEstados({ total, conteo }) {
  const pActivos = pct(conteo.activo, total);

  escribir('estado-activos', `${conteo.activo} (${pActivos}%)`);
  escribir('estado-borradores', `${conteo.borrador} (${pct(conteo.borrador, total)}%)`);
  escribir('estado-archivados', `${conteo.archivado} (${pct(conteo.archivado, total)}%)`);
  escribir('estado-pct-activos', `${pActivos}%`);

  el('donut-activos')?.setAttribute('stroke-dasharray', `${pActivos} ${100 - pActivos}`);
}

function filaHTML(plan) {
  const etiqueta = plan.etiqueta ? `<span class="etiqueta">${esc(plan.etiqueta)}</span>` : '';
  return `
    <tr>
      <td>${esc(plan.usuarioId)}</td>
      <td><span class="nombre-plan">${esc(plan.nombre)}</span> ${etiqueta}</td>
      <td>${rango(plan.fechaInicio, plan.fechaFin)}</td>
      <td><strong>${numero(plan.comidasAsignadas)}</strong> / ${COMIDAS_POR_PLAN}</td>
      <td><span class="badge badge-${esc(plan.estado)}">${ETIQUETA_ESTADO[plan.estado] ?? esc(plan.estado)}</span></td>
      <td><button class="btn-ver" data-id="${esc(plan.id)}" aria-label="Ver auditoría">Ver</button></td>
    </tr>`;
}

function pintarTabla(lista) {
  const tbody = el('tbody-planes');
  if (!tbody) {
    console.warn('Falta #tbody-planes en el HTML');
    return;
  }

  if (lista.length === 0) {
    const mensaje = todosLosPlanes.length === 0
      ? 'Aún no hay planes creados. Usa «+ Nuevo Plan Base» para empezar.'
      : 'Ningún plan coincide con los filtros.';
    tbody.innerHTML = `<tr><td colspan="6" class="sin-planes">${mensaje}</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(filaHTML).join('');
}

function filtrar(lista) {
  const texto = (el('buscador-planes')?.value ?? '').trim().toLowerCase();
  const estado = el('filtro-estado')?.value ?? 'todos';
  const contiene = valor => String(valor ?? '').toLowerCase().includes(texto);

  return lista.filter(plan =>
    (estado === 'todos' || plan.estado === estado) &&
    (contiene(plan.usuarioId) || contiene(plan.nombre))
  );
}

function refrescarTabla() {
  pintarTabla(filtrar(todosLosPlanes));
}

async function renderizar() {
  todosLosPlanes = await leerPlanes();
  const metricas = calcularMetricas(todosLosPlanes);
  pintarKpis(metricas);
  pintarEstados(metricas);
  refrescarTabla();
}

document.addEventListener('DOMContentLoaded', () => {
  renderizar();

  el('buscador-planes')?.addEventListener('input', refrescarTabla);
  el('filtro-estado')?.addEventListener('change', refrescarTabla);
  el('limpiar-filtros')?.addEventListener('click', () => {
    const buscador = el('buscador-planes');
    const selector = el('filtro-estado');
    if (buscador) buscador.value = '';
    if (selector) selector.value = 'todos';
    refrescarTabla();
  });

  window.addEventListener('storage', evento => {
    if (evento.key === CLAVE_PLANES) renderizar();
  });
});