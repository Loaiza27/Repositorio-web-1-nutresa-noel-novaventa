(function () {
  "use strict";

  const ID_USUARIO_INICIAL = 1;
  const MS_POR_DIA = 86400000;

  function calcularSemana(fechaIso) {
    if (!fechaIso) return null;
    const [y, m, d] = fechaIso.split("-").map(Number);
    const fecha = new Date(Date.UTC(y, m - 1, d));
    if (isNaN(fecha.getTime())) return null;
    const diaSemana = fecha.getUTCDay() || 7;
    const jueves = new Date(fecha);
    jueves.setUTCDate(jueves.getUTCDate() + (4 - diaSemana));
    const inicio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 1));
    return Math.floor((jueves.getTime() - inicio.getTime()) / (7 * MS_POR_DIA)) + 1;
  }

  const MENSAJES = {
    nombreVacio: "El nombre es obligatorio", nombreLongitud: "Debe tener entre 3 y 60 caracteres",
    fechaInicio: "La fecha de inicio es obligatoria", fechaFinVacia: "La fecha de finalización es obligatoria",
    fechaFin: "Debe ser posterior a la fecha de inicio y estar dentro de los 7 días siguientes",
    activo: "El estado es obligatorio", idUsuario: "El identificador debe ser positivo"
  };

  function crearElemento(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  class PlanSemanal {
    constructor(servicio) {
      this.servicio = servicio;
      this.idUsuarioFiltrado = ID_USUARIO_INICIAL;
      this.planEnEdicion = null;
      this.temporizadorMensaje = null;
      this._cacheDom();
      this._enlazarEventos();
      this.dom.filtroIdUsuario.value = this.idUsuarioFiltrado;
      this.render();
      if (this.dom.inputSemana && this.dom.inputSemana.value) { this._cargarCalendarioSemana(); }
    }

    _cacheDom() {
      const $ = (id) => document.getElementById(id);
      this.dom = {
        btnCrear: $("planificador-btn-crear"), btnCrearVacio: $("planificador-btn-crear-vacio"),
        formFiltro: $("planificador-form-filtro"), filtroIdUsuario: $("planificador-filtro-idusuario"),
        errorFiltro: $("planificador-error-filtro"), contador: $("planificador-contador"),
        lista: $("planificador-lista"), vacio: $("planificador-vacio"),
        formSemana: $("planificador-form-semana"), inputSemana: $("planificador-input-semana"),
        errorSemana: $("planificador-error-semana"), semanaEstado: $("planificador-semana-estado"),
        calendarioContenido: $("planificador-calendario-contenido"),
        modalPlan: $("planificador-modal-plan"), modalTitulo: $("planificador-modal-titulo"),
        formPlan: $("planificador-form-plan"), inputId: $("planificador-id"),
        inputIdUsuario: $("planificador-idusuario"), inputNombre: $("planificador-nombre"),
        inputFechaInicio: $("planificador-fecha-inicio"), inputFechaFin: $("planificador-fecha-fin"),
        inputSemanaPlan: $("planificador-semana"), inputActivo: $("planificador-activo"),
        btnCancelar: $("planificador-btn-cancelar"),
        modalDetalle: $("planificador-modal-detalle"), detalle: $("planificador-detalle"),
        btnCerrarDetalle: $("planificador-btn-cerrar-detalle"),
        mensajeExito: $("planificador-mensaje-exito"), mensajeError: $("planificador-mensaje-error")
      };
      this.campos = [
        { entrada: this.dom.inputIdUsuario, error: $("planificador-error-idusuario") },
        { entrada: this.dom.inputNombre, error: $("planificador-error-nombre") },
        { entrada: this.dom.inputFechaInicio, error: $("planificador-error-fecha-inicio") },
        { entrada: this.dom.inputFechaFin, error: $("planificador-error-fecha-fin") },
        { entrada: this.dom.inputActivo, error: $("planificador-error-activo") }
      ];
      this.dom.errorGeneral = $("planificador-error-general") || this._crearErrorGeneral();
    }

    _crearErrorGeneral() {
      const p = crearElemento("p", "planificador-error planificador-error-general");
      p.id = "planificador-error-general"; p.setAttribute("role", "alert");
      const a = this.dom.formPlan.querySelector(".planificador-modal-acciones");
      if (a) a.before(p); else this.dom.formPlan.append(p);
      return p;
    }

    _enlazarEventos() {
      this.dom.btnCrear.addEventListener("click", () => this.abrirModalCreacion());
      this.dom.btnCrearVacio.addEventListener("click", () => this.abrirModalCreacion());
      this.dom.formFiltro.addEventListener("submit", (e) => { e.preventDefault(); this.filtrarPorUsuario(); });
      this.dom.formPlan.addEventListener("submit", (e) => this._guardarPlan(e));
      this.dom.btnCancelar.addEventListener("click", () => this.cerrarModal());
      this.dom.btnCerrarDetalle.addEventListener("click", () => this.cerrarModalDetalle());
      this.dom.modalPlan.addEventListener("close", () => { this.planEnEdicion = null; });
      if (this.dom.formSemana) { this.dom.formSemana.addEventListener("submit", (e) => { e.preventDefault(); this._cargarCalendarioSemana(); }); }
    }

    validarNombre(n) { const t = (n || "").trim(); if (!t) return MENSAJES.nombreVacio; if (t.length < 3 || t.length > 60) return MENSAJES.nombreLongitud; return ""; }
    validarFechaInicio(f) { return this._aTiempo(f) === null ? MENSAJES.fechaInicio : ""; }
    validarFechaFin(f, i) { const fin = this._aTiempo(f); if (!fin) return MENSAJES.fechaFinVacia; const ini = this._aTiempo(i); if (!ini) return ""; const d = Math.round((fin - ini) / MS_POR_DIA); return d >= 1 && d <= 7 ? "" : MENSAJES.fechaFin; }
    validarActivo(a) { return a === "true" || a === "false" ? "" : MENSAJES.activo; }
    validarIdUsuario(u) { const n = Number(u); return u !== "" && Number.isInteger(n) && n > 0 ? "" : MENSAJES.idUsuario; }
    _aTiempo(f) { if (!f) return null; const [y, m, d] = f.split("-").map(Number); const t = Date.UTC(y, m - 1, d); return isNaN(t) ? null : t; }

    _validarFormulario() {
      const v = this._leerFormulario();
      const errs = [this.validarIdUsuario(this.dom.inputIdUsuario.value), this.validarNombre(v.nombre), this.validarFechaInicio(v.fechaInicio), this.validarFechaFin(v.fechaFin, v.fechaInicio), this.validarActivo(this.dom.inputActivo.value)];
      let p = null;
      this.campos.forEach((c, i) => { c.error.textContent = errs[i]; if (errs[i]) { c.entrada.setAttribute("aria-invalid", "true"); if (!p) p = c.entrada; } else c.entrada.removeAttribute("aria-invalid"); });
      if (p) p.focus(); return p === null;
    }

    _limpiarErrores() { this.dom.errorGeneral.textContent = ""; this.campos.forEach((c) => { c.error.textContent = ""; c.entrada.removeAttribute("aria-invalid"); }); }

    _leerFormulario() {
      const esc = this.dom.inputSemanaPlan ? this.dom.inputSemanaPlan.value.trim() : "";
      let s = null;
      if (esc) { s = Number(esc); if (!Number.isInteger(s) || s < 1 || s > 53) s = null; }
      if (s === null) s = calcularSemana(this.dom.inputFechaInicio.value);
      return { idUsuario: Number(this.dom.inputIdUsuario.value), nombre: this.dom.inputNombre.value.trim(), fechaInicio: this.dom.inputFechaInicio.value, fechaFin: this.dom.inputFechaFin.value, activo: this.dom.inputActivo.value === "true", semana: s };
    }

    async render() {
      try {
        const lista = this.idUsuarioFiltrado === null ? await this.servicio.listarTodos() : await this.servicio.listarPorIdUsuario(this.idUsuarioFiltrado);
        this.dom.lista.replaceChildren(...lista.map((p) => this._crearTarjetaPlan(p)));
        this.dom.contador.textContent = lista.length === 0 ? "0 planes encontrados" : lista.length === 1 ? "1 plan encontrado" : `${lista.length} planes encontrados`;
        this.dom.vacio.hidden = lista.length > 0;
      } catch (e) { this._notificar("No se pudieron cargar los planes.", true); }
    }

    _crearTarjetaPlan(plan) {
      const t = crearElemento("article", "planificador-tarjeta");
      t.dataset.id = plan.id;
      t.append(crearElemento("span", `planificador-estado ${plan.activo ? "planificador-estado-activo" : "planificador-estado-inactivo"}`, plan.activo ? "Activo" : "Inactivo"), crearElemento("h2", "planificador-tarjeta-nombre", plan.nombre), crearElemento("p", "planificador-tarjeta-fechas", `${this._formatearFecha(plan.fechaInicio)} – ${this._formatearFecha(plan.fechaFin)}`));
      t.append(this._crearDiasSemana(plan));
      const a = crearElemento("div", "planificador-tarjeta-acciones");
      a.append(this._crearBotonAccion("Consultar", "planificador-btn-consultar", plan, () => this._abrirDetalle(plan.id)));
      a.append(this._crearBotonAccion("Editar", "planificador-btn-editar", plan, () => this.abrirModalEdicion(plan)));
      a.append(this._crearBotonAccion("Eliminar", "planificador-btn-eliminar", plan, () => this._confirmarEliminar(plan)));
      t.append(a); return t;
    }

    _crearDiasSemana(plan) {
      const DIAS = [{ clave: "lun", nombre: "Lun", nombreLargo: "Lunes" }, { clave: "mar", nombre: "Mar", nombreLargo: "Martes" }, { clave: "mie", nombre: "Mié", nombreLargo: "Miércoles" }, { clave: "jue", nombre: "Jue", nombreLargo: "Jueves" }, { clave: "vie", nombre: "Vie", nombreLargo: "Viernes" }, { clave: "sab", nombre: "Sáb", nombreLargo: "Sábado" }, { clave: "dom", nombre: "Dom", nombreLargo: "Domingo" }];
      const TIEMPOS = [{ clave: "desayuno", etiqueta: "Desayuno" }, { clave: "almuerzo", etiqueta: "Almuerzo" }, { clave: "cena", etiqueta: "Cena" }];
      const recetas = plan.dias || {};
      const lista = crearElemento("ul", "planificador-dias"); lista.setAttribute("aria-label", "Recetas por día del plan");
      DIAS.forEach((dia) => {
        const rd = recetas[dia.clave]; let dn;
        if (typeof rd === "string") dn = { almuerzo: rd.trim() }; else if (rd && typeof rd === "object") dn = { ...rd }; else dn = {};
        const item = crearElemento("li", "planificador-dia-item");
        const card = crearElemento("article", "planificador-dia-card");
        card.dataset.dia = dia.clave; card.setAttribute("aria-label", `${dia.nombreLargo}: ${this._resumenDia(dn)}`);
        const enc = crearElemento("header", "planificador-dia-card-encabezado");
        enc.append(crearElemento("span", "planificador-dia-nombre", dia.nombre));
        const zona = crearElemento("span", "planificador-dia-zona");
        const tiene = TIEMPOS.some((t) => String(dn[t.clave] || "").trim() !== "");
        zona.append(this._crearIcono(tiene ? "receta" : "mas")); enc.append(zona); card.append(enc);
        const slots = crearElemento("div", "planificador-receta-slots");
        TIEMPOS.forEach((tiempo) => {
          const receta = String(dn[tiempo.clave] || "").trim();
          const slot = crearElemento("div", `planificador-receta-slot ${receta ? "planificador-receta-slot-ocupado" : "planificador-receta-slot-vacio"}`);
          slot.dataset.tiempo = tiempo.clave; slot.setAttribute("role", "button"); slot.setAttribute("tabindex", "0");
          slot.setAttribute("aria-label", receta ? `${tiempo.etiqueta} en ${dia.nombreLargo}: ${receta}` : `${tiempo.etiqueta} en ${dia.nombreLargo}: vacío`);
          slot.addEventListener("click", () => this._editarSlot(plan, dia, tiempo.clave, dn[tiempo.clave]));
          slot.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._editarSlot(plan, dia, tiempo.clave, dn[tiempo.clave]); } });
          const et = crearElemento("span", "planificador-receta-slot-tiempo", tiempo.etiqueta);
          const er = crearElemento("span", "planificador-receta-slot-receta", receta || "Vacío"); if (receta) er.title = receta;
          slot.append(et, er); slots.append(slot);
        });
        card.append(slots); item.append(card); lista.append(item);
      });
      return lista;
    }

    _resumenDia(dn) { const r = Object.values(dn || {}).map((x) => String(x || "").trim()).filter((x) => x !== ""); return r.length === 0 ? "Vacío" : r.join(", "); }

    _crearIcono(tipo) {
      const NS = "http://www.w3.org/2000/svg"; const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("class", "planificador-dia-icono"); svg.setAttribute("aria-hidden", "true");
      const trazo = (f, a) => { const el = document.createElementNS(NS, f); Object.entries(a).forEach(([k, v]) => el.setAttribute(k, v)); svg.append(el); };
      if (tipo === "mas") trazo("path", { d: "M12 6v12M6 12h12" });
      else { trazo("path", { d: "M12 3c3 0 5 1.5 6.5 3.5 1.5 2 .5 4 2 5.5 1 1 .5 3.5-1.5 5.5-2 2-4.5 2.5-7 2.5s-5-.5-7-2.5c-2-2-2.5-4.5-1.5-5.5 1.5-1.5.5-3.5 2-5.5C7 4.5 9 3 12 3z" }); trazo("circle", { cx: "12", cy: "12", r: "3" }); }
      return svg;
    }

    async _editarSlot(plan, dia, tiempo, actual) {
      if (plan.origen === "api") { this._notificar("Este plan viene de MockAPI y es de solo lectura.", true); return; }
      const texto = window.prompt(`Receta para ${dia.nombreLargo} · ${tiempo} (vacío para quitar):`, String(actual || ""));
      if (texto === null) return;
      const receta = texto.trim().slice(0, 40);
      try {
        const da = (plan.dias && plan.dias[dia.clave]) || {};
        const db = typeof da === "object" && da !== null ? { ...da } : (tiempo === "almuerzo" ? { almuerzo: String(da || "") } : {});
        const dias = { ...(plan.dias || {}), [dia.clave]: { ...db, [tiempo]: receta } };
        const act = await this.servicio.actualizar(plan.id, { ...plan, dias });
        const sync = await this._sincronizarApi(act);
        this._notificar(act === null ? "El plan ya no existe." : sync === false ? "Día actualizado, pero no se pudo guardar en MockAPI." : "Día actualizado.", act === null || sync === false);
        this.render();
        if (this.dom.inputSemana && this.dom.inputSemana.value) this._cargarCalendarioSemana();
      } catch (e) { this._notificar("No se pudo actualizar.", true); }
    }

    /* Si el plan se guardó en MockAPI al crearlo, replica el cambio (PUT) y refresca el historial.
       Devuelve true/false según el resultado, o null si el plan no está vinculado a MockAPI. */
    async _sincronizarApi(plan) {
      if (!plan || !window.planApiServicio.vinculos.has(plan.id)) return null;
      try { await window.planApiServicio.actualizar(plan.id, plan); } catch (e) { return false; }
      if (window.planificadorHistorialApi) window.planificadorHistorialApi.recargar();
      return true;
    }

    _crearBotonAccion(texto, clase, plan, fn) {
      const b = crearElemento("button", `btn planificador-btn-accion ${clase}`, texto);
      b.type = "button"; b.setAttribute("aria-label", `${texto} plan ${plan.nombre}`); b.addEventListener("click", fn); return b;
    }

    _formatearFecha(f) { if (!f) return "—"; const [y, m, d] = f.split("-"); return `${d}/${m}/${y}`; }

    /* HU 5.1.1: _cargarCalendarioSemana — obtenerPlanSemanal(semana) + await + try/catch */
    async _cargarCalendarioSemana() {
      if (!this.dom.calendarioContenido) return;
      const cargando = crearElemento("div", "planificador-calendario-cargando"); cargando.textContent = "Cargando plan…";
      this.dom.calendarioContenido.replaceChildren(cargando); this.dom.errorSemana.textContent = "";
      const valor = this.dom.inputSemana.value.trim();
      if (valor === "") { this.dom.calendarioContenido.replaceChildren(); const v = crearElemento("div", "planificador-calendario-vacio"); v.textContent = "Escribe un número de semana (1-53) y pulsa \"Ver plan\"."; this.dom.calendarioContenido.append(v); return; }
      const numero = Number(valor);
      if (!Number.isInteger(numero) || numero < 1 || numero > 53) { this.dom.errorSemana.textContent = "La semana debe ser un entero entre 1 y 53."; this.dom.inputSemana.setAttribute("aria-invalid", "true"); this.dom.calendarioContenido.replaceChildren(); return; }
      this.dom.inputSemana.removeAttribute("aria-invalid");
      try {
        const plan = await this.servicio.obtenerPlanSemanal(numero);
        this.dom.semanaEstado.textContent = plan === null ? `No existe plan para la semana ${numero}` : `Plan #${plan.id}${plan.origen === "api" ? " (MockAPI)" : ""} · "${plan.nombre}" · semana ${plan.semana}`;
        this.dom.calendarioContenido.replaceChildren();
        if (plan === null) { const v = crearElemento("div", "planificador-calendario-vacio"); v.textContent = `No hay plan asignado para la semana ${numero}.`; this.dom.calendarioContenido.append(v); return; }
        const art = crearElemento("article", "planificador-calendario-plan"); art.dataset.id = plan.id;
        art.append(crearElemento("h3", "planificador-calendario-plan-nombre", plan.nombre), crearElemento("p", "planificador-calendario-plan-fecha", `${this._formatearFecha(plan.fechaInicio)} – ${this._formatearFecha(plan.fechaFin)}`), this._crearDiasSemana(plan));
        this.dom.calendarioContenido.append(art);
      } catch (error) { this.dom.calendarioContenido.replaceChildren(); const err = crearElemento("p", "planificador-error"); err.textContent = error.message || "No se pudo cargar el plan."; this.dom.calendarioContenido.append(err); }
    }

    filtrarPorUsuario() {
      const v = this.dom.filtroIdUsuario.value.trim();
      if (v !== "" && this.validarIdUsuario(v) !== "") { this.dom.errorFiltro.textContent = MENSAJES.idUsuario; this.dom.filtroIdUsuario.setAttribute("aria-invalid", "true"); this.dom.filtroIdUsuario.focus(); return; }
      this.dom.errorFiltro.textContent = ""; this.dom.filtroIdUsuario.removeAttribute("aria-invalid"); this.idUsuarioFiltrado = v === "" ? null : Number(v); this.render();
    }

    abrirModalCreacion() { this.planEnEdicion = null; this.dom.modalTitulo.textContent = "Crear plan semanal"; this.dom.formPlan.reset(); this.dom.inputId.value = ""; if (this.idUsuarioFiltrado) this.dom.inputIdUsuario.value = this.idUsuarioFiltrado; if (this.dom.inputSemanaPlan) this.dom.inputSemanaPlan.value = ""; this._limpiarErrores(); this.dom.modalPlan.showModal(); }
    abrirModalEdicion(plan) { this.planEnEdicion = plan; this.dom.modalTitulo.textContent = `Editar plan #${plan.id}`; this.dom.inputId.value = plan.id; this.dom.inputIdUsuario.value = plan.idUsuario; this.dom.inputNombre.value = plan.nombre; this.dom.inputFechaInicio.value = plan.fechaInicio; this.dom.inputFechaFin.value = plan.fechaFin; if (this.dom.inputSemanaPlan) this.dom.inputSemanaPlan.value = plan.semana != null ? plan.semana : ""; this.dom.inputActivo.value = String(plan.activo); this._limpiarErrores(); this.dom.modalPlan.showModal(); }
    cerrarModal() { this.dom.modalPlan.close(); }

    async _guardarPlan(e) {
      e.preventDefault(); if (!this._validarFormulario()) return;
      const datos = this._leerFormulario(); this.dom.errorGeneral.textContent = "";
      try {
        if (this.planEnEdicion) { const act = await this.servicio.actualizar(this.planEnEdicion.id, { ...this.planEnEdicion, ...datos }); if (act === null) { this._notificar("El plan ya no existe.", true); } else { const sync = await this._sincronizarApi(act); this._notificar(sync === false ? "Plan actualizado, pero no se pudo guardar en MockAPI." : "Plan actualizado.", sync === false); } }
        else {
          const creado = await this.servicio.crear(datos);
          let guardadoEnApi = true;
          try { await window.planApiServicio.crear(creado); } catch (errApi) { guardadoEnApi = false; }
          this._notificar(guardadoEnApi ? "Plan creado y guardado en MockAPI." : "Plan creado, pero no se pudo guardar en MockAPI.", !guardadoEnApi);
          if (creado.semana && this.dom.inputSemana) this.dom.inputSemana.value = creado.semana;
          if (window.planificadorHistorialApi) window.planificadorHistorialApi.recargar();
        }
        this.idUsuarioFiltrado = datos.idUsuario; this.dom.filtroIdUsuario.value = datos.idUsuario; this.dom.errorFiltro.textContent = ""; this.dom.filtroIdUsuario.removeAttribute("aria-invalid");
        this.cerrarModal(); this.render();
        if (this.dom.inputSemana && this.dom.inputSemana.value) this._cargarCalendarioSemana();
      } catch (e) { this.dom.errorGeneral.textContent = e.message || "No se pudo guardar."; }
    }

    async _confirmarEliminar(plan) {
      if (!window.confirm(`¿Eliminar "${plan.nombre}"?`)) return;
      try { const el = await this.servicio.eliminar(plan.id); this._notificar(el ? "Eliminado." : "Ya no existía.", !el); this.render(); if (this.dom.inputSemana && this.dom.inputSemana.value) this._cargarCalendarioSemana(); }
      catch (e) { this._notificar("No se pudo eliminar.", true); }
    }

    async _abrirDetalle(id) {
      try { const plan = await this.servicio.buscarPorId(id); if (plan === null) { this._notificar("Ya no existe.", true); this.render(); return; }
        const filas = [["ID", `#${plan.id}`],["Nombre", plan.nombre],["Usuario", String(plan.idUsuario)],["Inicio", this._formatearFecha(plan.fechaInicio)],["Fin", this._formatearFecha(plan.fechaFin)],["Estado", plan.activo ? "Activo" : "Inactivo"]];
        const nodos = []; filas.forEach(([e, v]) => { const f = crearElemento("div", "planificador-detalle-fila"); f.append(crearElemento("dt", "planificador-detalle-etiqueta", e), crearElemento("dd", "planificador-detalle-valor", v)); nodos.push(f); });
        this.dom.detalle.replaceChildren(...nodos); this.dom.modalDetalle.showModal();
      } catch (e) { this._notificar("No se pudo consultar.", true); }
    }

    cerrarModalDetalle() { this.dom.modalDetalle.close(); }

    _notificar(mensaje, esError) {
      const caja = esError ? this.dom.mensajeError : this.dom.mensajeExito;
      this.dom.mensajeExito.classList.remove("planificador-visible"); this.dom.mensajeError.classList.remove("planificador-visible");
      caja.textContent = mensaje; caja.classList.add("planificador-visible"); clearTimeout(this.temporizadorMensaje);
      this.temporizadorMensaje = setTimeout(() => { caja.classList.remove("planificador-visible"); caja.textContent = ""; }, 3500);
    }
  }

  document.addEventListener("DOMContentLoaded", () => { window.planSemanalApp = new PlanSemanal(window.planSemanalServicio); });
})();

/* ===== G5-LIS · Lista de Mercado (Samudio) ===== */
(function () {
  "use strict";
  document.addEventListener('DOMContentLoaded', () => {
    const formLista = document.getElementById('listamercado-form');
    if (!formLista) return;
    const selectPlan = document.getElementById('listamercado-idPlanSemanal');
    const mensajeContenedor = document.getElementById('listamercado-mensaje');
    const mostrarMensaje = (texto, tipo) => { mensajeContenedor.textContent = texto; mensajeContenedor.setAttribute('role', tipo === 'error' ? 'alert' : 'status'); mensajeContenedor.className = tipo === 'error' ? 'listamercado-alerta-error' : 'listamercado-alerta-exito'; mensajeContenedor.style.display = 'block'; setTimeout(() => { mensajeContenedor.style.display = 'none'; }, 4000); };
    const cargarPlanesSemanales = async () => {
      try { const planes = await window.planSemanalServicio.listarTodos(); selectPlan.innerHTML = '<option value="">Seleccione un plan...</option>'; if (planes && planes.length > 0) { planes.forEach((p) => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.nombre; selectPlan.append(o); }); } else selectPlan.innerHTML = '<option value="">No hay planes creados</option>'; }
      catch (e) { console.error(e); selectPlan.innerHTML = '<option value="">Error al cargar</option>'; }
    };
    cargarPlanesSemanales();
    formLista.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('listamercado-nombre').value.trim();
      const presupuestoRaw = document.getElementById('listamercado-presupuesto').value;
      const idPlanSemanal = document.getElementById('listamercado-idPlanSemanal').value;
      const presupuesto = parseFloat(presupuestoRaw);
      if (!nombre || isNaN(presupuesto) || presupuesto <= 0 || !idPlanSemanal) { mostrarMensaje("Faltan datos. Presupuesto debe ser mayor a 0.", "error"); return; }
      const hoy = new Date();
      const fechaCreacionLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      const nueva = { id: null, nombre, fechaCreacion: fechaCreacionLocal, presupuesto, completada: false, idPlanSemanal: parseInt(idPlanSemanal) };
      try { await window.listaMercadoServicio.crear(nueva); console.log("=== Payload Guardado ===", nueva); mostrarMensaje("¡Lista creada!", "exito"); formLista.reset(); }
      catch (e) { console.error(e); mostrarMensaje("Error al guardar.", "error"); }
    });
  });
})();

<<<<<<< HEAD
/* ===== G5-API · historial real desde MockAPI (a través de planApiServicio) ===== */
(function () {
  "use strict";
  const ORDEN_DIAS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
  const NOMBRE_DIA = { lun: "Lun", mar: "Mar", mie: "Mié", jue: "Jue", vie: "Vie", sab: "Sáb", dom: "Dom" };
  const CAMPOS_FECHA = ["fechaInicio", "fechaFin", "fechaCreacion", "fechaActualizacion"];

  function crearElemento(etiqueta, clase, texto) { const el = document.createElement(etiqueta); if (clase) el.className = clase; if (texto !== undefined) el.textContent = texto; return el; }

  /* Valor tal cual llega de la API (solo se formatea para poder leerlo). */
  function textoValor(clave, v) {
    if (v === null || v === undefined || v === "") return "(vacío)";
    if (CAMPOS_FECHA.includes(clave) && typeof v === "number") { const d = new Date(v < 1e12 ? v * 1000 : v); return isNaN(d.getTime()) ? String(v) : d.toISOString(); }
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  function textoComidas(v) {
    if (v && typeof v === "object") {
      const partes = Object.entries(v).map(([t, r]) => `${t}: ${String(r || "").trim() || "Vacío"}`);
      return partes.length ? partes.join(" · ") : "(vacío)";
    }
    return textoValor("", v);
  }

  function crearBloqueDias(dias) {
    const caja = crearElemento("div", "planificador-api-captura-dias");
    caja.append(crearElemento("h3", "planificador-api-captura-dias-titulo", "dias"));
    const esObjeto = dias && typeof dias === "object" && !Array.isArray(dias);
    if (!esObjeto || Object.keys(dias).length === 0) { caja.append(crearElemento("p", "planificador-api-captura-dias-vacio", textoValor("dias", dias && typeof dias === "object" && Object.keys(dias).length === 0 ? "" : dias))); return caja; }
    const claves = [...ORDEN_DIAS.filter((d) => d in dias), ...Object.keys(dias).filter((d) => !ORDEN_DIAS.includes(d))];
    const ul = crearElemento("ul", "planificador-api-captura-dias-lista");
    claves.forEach((d) => { const li = crearElemento("li", "planificador-api-captura-dias-item"); li.append(crearElemento("strong", "", `${NOMBRE_DIA[d] || d}: `), document.createTextNode(textoComidas(dias[d]))); ul.append(li); });
    caja.append(ul); return caja;
  }

  function crearTarjeta(registro) {
    const t = crearElemento("article", "planificador-api-captura-card"); t.dataset.id = registro.id;
    t.append(crearElemento("span", "planificador-api-captura-card-id", `Plan #${registro.id}`));
    const dl = crearElemento("dl", "planificador-api-captura-card-cuerpo");
    Object.keys(registro).filter((k) => k !== "id" && k !== "dias").forEach((k) => { dl.append(crearElemento("dt", "planificador-api-captura-card-clave", k), crearElemento("dd", "planificador-api-captura-card-valor", textoValor(k, registro[k]))); });
    t.append(dl);
    if ("dias" in registro) t.append(crearBloqueDias(registro.dias));
    return t;
  }

  /* Historial: registros de MockAPI con ID 1 al 8 (los mismos planes de las tarjetas de arriba, con sus
     datos reales: nombre, fechas, estado, usuario, semana y días) más los que se crean desde el formulario. */
  const ID_MAXIMO_HISTORIAL = 8;
  function prepararHistorial(registros, locales) {
    const creados = window.planApiServicio.idsCreados;
    return registros
      .filter((r) => Number(r.id) <= ID_MAXIMO_HISTORIAL || creados.has(String(r.id)))
      .map((r) => {
        const plan = Number(r.id) <= ID_MAXIMO_HISTORIAL ? locales.find((p) => p.id === Number(r.id)) : null;
        if (!plan) return r;
        const { id, nombre, fechaInicio, fechaFin, activo, idUsuario, semana, dias } = plan;
        return { id, nombre, fechaInicio, fechaFin, activo, idUsuario, semana, dias };
      });
  }

  function renderizar(lista, contenedor, estado) {
    contenedor.replaceChildren();
    if (lista.length === 0) { contenedor.append(crearElemento("div", "planificador-api-captura-vacio", "No hay planes en MockAPI.")); estado.textContent = "0 planes"; return; }
    estado.textContent = `${lista.length} plan(es) recibido(s)`;
    contenedor.append(...lista.map(crearTarjeta));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("planificador-btn-cargar-api");
    const lista = document.getElementById("planificador-api-captura-lista");
    const estado = document.getElementById("planificador-api-captura-estado");
    if (!btn || !lista || !estado) return;
    async function cargar() {
      btn.disabled = true; btn.textContent = "Cargando…"; estado.textContent = "Solicitando…";
      lista.replaceChildren(crearElemento("div", "planificador-api-captura-cargando", "Cargando desde MockAPI…"));
      try {
        const registros = await window.planApiServicio.listar();
        const locales = await window.planSemanalServicio.listarTodos();
        renderizar(prepararHistorial(registros, locales), lista, estado);
      }
      catch (error) { lista.replaceChildren(crearElemento("div", "planificador-api-captura-error", `No se pudo cargar: ${error.message}`)); estado.textContent = "Error"; }
      finally { btn.disabled = false; btn.textContent = "Cargar desde API"; }
    }
    btn.addEventListener("click", cargar);
    window.planificadorHistorialApi = { recargar: cargar };
  });
})();
/* ===== G5-API · fin ===== */
=======
// ===== G5-COM · ComidaPlanificada · inicio =====
(function () {
  const ID_PLAN_SEMANAL = 1;
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const TIPOS = ["Desayuno", "Almuerzo", "Merienda", "Cena"];

  const form = document.getElementById("formComida");
  const selDia = document.getElementById("diaSemana");
  const selTipo = document.getElementById("tipoComida");
  const selReceta = document.getElementById("idReceta");
  const inpPorciones = document.getElementById("porciones");
  const mensaje = document.getElementById("mensaje");
  const semana = document.getElementById("semana");

  let recetas = [];

  function llenarSelect(select, valores) {
    valores.forEach((v) => select.add(new Option(v, v)));
  }

  function avisar(texto, esError) {
    mensaje.textContent = texto;
    mensaje.classList.toggle("planificador-mensaje-error", Boolean(esError));
  }

  function nombreReceta(id) {
    const r = recetas.find((x) => x.id === id);
    return r ? r.nombre : "Receta #" + id;
  }

  function crear(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function tarjetaComida(c) {
    const li = crear("li", "comida-item");
    li.appendChild(crear("strong", "", c.tipoComida));
    li.appendChild(crear("span", "comida-receta", nombreReceta(c.idReceta)));
    li.appendChild(crear("span", "comida-porciones", c.porciones + (c.porciones === 1 ? " porción" : " porciones")));

    const quitar = crear("button", "comida-quitar", "Quitar");
    quitar.type = "button";
    quitar.setAttribute("aria-label", `Quitar ${c.tipoComida} del ${c.díaSemana}`);
    quitar.addEventListener("click", () => quitarComida(c.id));
    li.appendChild(quitar);
    return li;
  }

  async function pintarSemana() {
    const comidas = await PlanificadorServicio.listarComidas(ID_PLAN_SEMANAL);
    semana.replaceChildren();

    DIAS.forEach((dia) => {
      const delDia = comidas
        .filter((c) => c.díaSemana === dia)
        .sort((a, b) => TIPOS.indexOf(a.tipoComida) - TIPOS.indexOf(b.tipoComida));

      const dEl = crear("article", "dia-card");
      dEl.appendChild(crear("h3", "", dia));

      if (delDia.length === 0) {
        dEl.appendChild(crear("p", "dia-vacio", "Sin comidas planificadas."));
      } else {
        const ul = crear("ul", "comidas-lista");
        delDia.forEach((c) => ul.appendChild(tarjetaComida(c)));
        dEl.appendChild(ul);
      }
      semana.appendChild(dEl);
    });
  }

  async function quitarComida(id) {
    try {
      await PlanificadorServicio.eliminarComida(id);
      avisar("Comida quitada del plan.");
      await pintarSemana();
    } catch (e) {
      avisar(e.message, true);
    }
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const porciones = parseInt(inpPorciones.value, 10);

    if (!selReceta.value) return avisar("Selecciona una receta.", true);
    if (!porciones || porciones < 1) return avisar("Las porciones deben ser al menos 1.", true);

    // Mismos nombres que la clase ComidaPlanificada
    const payload = {
      díaSemana: selDia.value,
      tipoComida: selTipo.value,
      porciones: porciones,
      idReceta: Number(selReceta.value),
      idPlanSemanal: ID_PLAN_SEMANAL
    };

    try {
      await PlanificadorServicio.planificarComida(payload);
      avisar(`Agregado: ${payload.tipoComida} del ${payload.díaSemana}.`);
      await pintarSemana();
    } catch (e) {
      avisar(e.message, true);
    }
  });

  async function iniciar() {
    llenarSelect(selDia, DIAS);
    llenarSelect(selTipo, TIPOS);
    try {
      recetas = await PlanificadorServicio.listarRecetas();
      recetas.forEach((r) => selReceta.add(new Option(r.nombre, r.id)));
      await pintarSemana();
    } catch (e) {
      avisar("No se pudo cargar el planificador: " + e.message, true);
    }
  }

  iniciar();
})();

// ===== G5-COM · ComidaPlanificada · fin =====
>>>>>>> upstream/develop
