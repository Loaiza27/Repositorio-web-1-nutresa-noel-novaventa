(function () {
  "use strict";

  const ID_USUARIO_INICIAL = 1;
  const MS_POR_DIA = 24 * 60 * 60 * 1000;

  const MENSAJES = {
    nombreVacio: "El nombre es obligatorio",
    nombreLongitud: "Debe tener entre 3 y 60 caracteres",
    fechaInicio: "La fecha de inicio es obligatoria",
    fechaFinVacia: "La fecha de finalización es obligatoria",
    fechaFin: "Debe ser posterior a la fecha de inicio y estar dentro de los 7 días siguientes",
    activo: "El estado es obligatorio",
    idUsuario: "El identificador debe ser positivo"
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
      this.render();
    }

    /* ---------- DOM ---------- */

    _cacheDom() {
      const $ = (id) => document.getElementById(id);
      this.dom = {
        btnCrear: $("planificador-btn-crear"),
        btnCrearVacio: $("planificador-btn-crear-vacio"),
        formFiltro: $("planificador-form-filtro"),
        filtroIdUsuario: $("planificador-filtro-idusuario"),
        errorFiltro: $("planificador-error-filtro"),
        contador: $("planificador-contador"),
        lista: $("planificador-lista"),
        vacio: $("planificador-vacio"),

        modalPlan: $("planificador-modal-plan"),
        modalTitulo: $("planificador-modal-titulo"),
        formPlan: $("planificador-form-plan"),
        inputId: $("planificador-id"),
        inputIdUsuario: $("planificador-idusuario"),
        inputNombre: $("planificador-nombre"),
        inputFechaInicio: $("planificador-fecha-inicio"),
        inputFechaFin: $("planificador-fecha-fin"),
        inputActivo: $("planificador-activo"),
        btnCancelar: $("planificador-btn-cancelar"),

        modalDetalle: $("planificador-modal-detalle"),
        detalle: $("planificador-detalle"),
        btnCerrarDetalle: $("planificador-btn-cerrar-detalle"),

        mensajeExito: $("planificador-mensaje-exito"),
        mensajeError: $("planificador-mensaje-error")
      };

      this.campos = [
        { entrada: this.dom.inputIdUsuario, error: $("planificador-error-idusuario") },
        { entrada: this.dom.inputNombre, error: $("planificador-error-nombre") },
        { entrada: this.dom.inputFechaInicio, error: $("planificador-error-fecha-inicio") },
        { entrada: this.dom.inputFechaFin, error: $("planificador-error-fecha-fin") },
        { entrada: this.dom.inputActivo, error: $("planificador-error-activo") }
      ];
    }

    _enlazarEventos() {
      this.dom.btnCrear.addEventListener("click", () => this.abrirModalCreacion());
      this.dom.btnCrearVacio.addEventListener("click", () => this.abrirModalCreacion());

      this.dom.formFiltro.addEventListener("submit", (e) => {
        e.preventDefault();
        this.filtrarPorUsuario();
      });

      this.dom.formPlan.addEventListener("submit", (e) => this._guardarPlan(e));
      this.dom.btnCancelar.addEventListener("click", () => this.cerrarModal());
      this.dom.btnCerrarDetalle.addEventListener("click", () => this.cerrarModalDetalle());

      // Esc cierra el <dialog>: se reinicia el estado de edición.
      this.dom.modalPlan.addEventListener("close", () => { this.planEnEdicion = null; });
    }

    /* ---------- Validaciones (mismo contrato que PlanSemanalValidación) ---------- */

    validarNombre(nombre) {
      const texto = (nombre || "").trim();
      if (texto.length === 0) return MENSAJES.nombreVacio;
      if (texto.length < 3 || texto.length > 60) return MENSAJES.nombreLongitud;
      return "";
    }

    validarFechaInicio(fechaInicio) {
      return this._aTiempo(fechaInicio) === null ? MENSAJES.fechaInicio : "";
    }

    validarFechaFin(fechaFin, fechaInicio) {
      const fin = this._aTiempo(fechaFin);
      if (fin === null) return MENSAJES.fechaFinVacia;
      const inicio = this._aTiempo(fechaInicio);
      if (inicio === null) return "";
      const dias = Math.round((fin - inicio) / MS_POR_DIA);
      return dias >= 1 && dias <= 7 ? "" : MENSAJES.fechaFin;
    }

    validarActivo(activo) {
      return activo === "true" || activo === "false" ? "" : MENSAJES.activo;
    }

    validarIdUsuario(idUsuario) {
      const numero = Number(idUsuario);
      return idUsuario !== "" && Number.isInteger(numero) && numero > 0 ? "" : MENSAJES.idUsuario;
    }

    _aTiempo(fechaIso) {
      if (!fechaIso) return null;
      const [y, m, d] = fechaIso.split("-").map(Number);
      const t = Date.UTC(y, m - 1, d);
      return Number.isNaN(t) ? null : t;
    }

    _validarFormulario() {
      const v = this._leerFormulario();
      const errores = [
        this.validarIdUsuario(this.dom.inputIdUsuario.value),
        this.validarNombre(v.nombre),
        this.validarFechaInicio(v.fechaInicio),
        this.validarFechaFin(v.fechaFin, v.fechaInicio),
        this.validarActivo(this.dom.inputActivo.value)
      ];
      let primero = null;
      this.campos.forEach((campo, i) => {
        campo.error.textContent = errores[i];
        if (errores[i]) {
          campo.entrada.setAttribute("aria-invalid", "true");
          if (!primero) primero = campo.entrada;
        } else {
          campo.entrada.removeAttribute("aria-invalid");
        }
      });
      if (primero) primero.focus();
      return primero === null;
    }

    _limpiarErrores() {
      this.campos.forEach((campo) => {
        campo.error.textContent = "";
        campo.entrada.removeAttribute("aria-invalid");
      });
    }

    _leerFormulario() {
      return {
        idUsuario: Number(this.dom.inputIdUsuario.value),
        nombre: this.dom.inputNombre.value.trim(),
        fechaInicio: this.dom.inputFechaInicio.value,
        fechaFin: this.dom.inputFechaFin.value,
        activo: this.dom.inputActivo.value === "true"
      };
    }

    /* ---------- Listado ---------- */

    async render() {
      try {
        const lista = this.idUsuarioFiltrado === null
          ? await this.servicio.listarTodos()
          : await this.servicio.listarPorIdUsuario(this.idUsuarioFiltrado);

        this.dom.lista.replaceChildren(...lista.map((plan) => this._crearTarjetaPlan(plan)));
        this.dom.contador.textContent =
          lista.length === 0 ? "0 planes encontrados" :
          lista.length === 1 ? "1 plan encontrado" : `${lista.length} planes encontrados`;
        this.dom.vacio.hidden = false;
      } catch (error) {
        this._notificar("No se pudieron cargar los planes.", true);
      }
    }

    _crearTarjetaPlan(plan) {
      const tarjeta = crearElemento("article", "planificador-tarjeta");
      tarjeta.dataset.id = plan.id;

      tarjeta.append(
        crearElemento(
          "span",
          `planificador-estado ${plan.activo ? "planificador-estado-activo" : "planificador-estado-inactivo"}`,
          plan.activo ? "Activo" : "Inactivo"
        ),
        crearElemento("h2", "planificador-tarjeta-nombre", plan.nombre),
        crearElemento(
          "p",
          "planificador-tarjeta-fechas",
          `${this._formatearFecha(plan.fechaInicio)} – ${this._formatearFecha(plan.fechaFin)}`
        )
      );

      const acciones = crearElemento("div", "planificador-tarjeta-acciones");
      const consultar = this._crearBotonAccion("Consultar", "planificador-btn-consultar", plan, () => this._abrirDetalle(plan.id));
      const editar = this._crearBotonAccion("Editar", "planificador-btn-editar", plan, () => this.abrirModalEdicion(plan));
      const eliminar = this._crearBotonAccion("Eliminar", "planificador-btn-eliminar", plan, () => this._confirmarEliminar(plan));
      acciones.append(consultar, editar, eliminar);

      tarjeta.append(acciones);
      return tarjeta;
    }

    _crearBotonAccion(texto, clase, plan, manejador) {
      const boton = crearElemento("button", `btn planificador-btn-accion ${clase}`, texto);
      boton.type = "button";
      boton.setAttribute("aria-label", `${texto} plan ${plan.nombre}`);
      boton.addEventListener("click", manejador);
      return boton;
    }

    _formatearFecha(fechaIso) {
      if (!fechaIso) return "—";
      const [y, m, d] = fechaIso.split("-");
      return `${d}/${m}/${y}`;
    }

    filtrarPorUsuario() {
      const valor = this.dom.filtroIdUsuario.value.trim();
      if (valor !== "" && this.validarIdUsuario(valor) !== "") {
        this.dom.errorFiltro.textContent = MENSAJES.idUsuario;
        this.dom.filtroIdUsuario.setAttribute("aria-invalid", "true");
        this.dom.filtroIdUsuario.focus();
        return;
      }
      this.dom.errorFiltro.textContent = "";
      this.dom.filtroIdUsuario.removeAttribute("aria-invalid");
      this.idUsuarioFiltrado = valor === "" ? null : Number(valor);
      this.render();
    }

    /* ---------- Crear / editar ---------- */

    abrirModalCreacion() {
      this.planEnEdicion = null;
      this.dom.modalTitulo.textContent = "Crear plan semanal";
      this.dom.formPlan.reset();
      this.dom.inputId.value = "";
      if (this.idUsuarioFiltrado) this.dom.inputIdUsuario.value = this.idUsuarioFiltrado;
      this._limpiarErrores();
      this.dom.modalPlan.showModal();
    }

    abrirModalEdicion(plan) {
      this.planEnEdicion = plan;
      this.dom.modalTitulo.textContent = `Editar plan #${plan.id}`;
      this.dom.inputId.value = plan.id;
      this.dom.inputIdUsuario.value = plan.idUsuario;
      this.dom.inputNombre.value = plan.nombre;
      this.dom.inputFechaInicio.value = plan.fechaInicio;
      this.dom.inputFechaFin.value = plan.fechaFin;
      this.dom.inputActivo.value = String(plan.activo);
      this._limpiarErrores();
      this.dom.modalPlan.showModal();
    }

    cerrarModal() {
      this.dom.modalPlan.close();
    }

    async _guardarPlan(e) {
      e.preventDefault();
      if (!this._validarFormulario()) return;

      const datos = this._leerFormulario();
      try {
        if (this.planEnEdicion) {
          const actualizado = await this.servicio.actualizar(this.planEnEdicion.id, datos);
          if (actualizado === null) {
            this._notificar("El plan ya no existe.", true);
          } else {
            this._notificar("Plan actualizado correctamente.");
          }
        } else {
          await this.servicio.crear(datos);
          this._notificar("Plan creado correctamente.");
        }
        this.cerrarModal();
        this.render();
      } catch (error) {
        this._notificar(error.message || "No se pudo guardar el plan.", true);
      }
    }

    /* ---------- Eliminar ---------- */

    async _confirmarEliminar(plan) {
      if (!window.confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return;
      try {
        const eliminado = await this.servicio.eliminar(plan.id);
        this._notificar(eliminado ? "Plan eliminado." : "El plan ya no existía.", !eliminado);
        this.render();
      } catch (error) {
        this._notificar("No se pudo eliminar el plan.", true);
      }
    }

    /* ---------- Consultar ---------- */

    async _abrirDetalle(id) {
      try {
        const plan = await this.servicio.buscarPorId(id);
        if (plan === null) {
          this._notificar("El plan ya no existe.", true);
          this.render();
          return;
        }
        const filas = [
          ["ID", `#${plan.id}`],
          ["Nombre", plan.nombre],
          ["ID de usuario", String(plan.idUsuario)],
          ["Fecha de inicio", this._formatearFecha(plan.fechaInicio)],
          ["Fecha de finalización", this._formatearFecha(plan.fechaFin)],
          ["Estado", plan.activo ? "Activo" : "Inactivo"]
        ];
        const nodos = [];
        filas.forEach(([etiqueta, valor]) => {
          const fila = crearElemento("div", "planificador-detalle-fila");
          fila.append(
            crearElemento("dt", "planificador-detalle-etiqueta", etiqueta),
            crearElemento("dd", "planificador-detalle-valor", valor)
          );
          nodos.push(fila);
        });
        this.dom.detalle.replaceChildren(...nodos);
        this.dom.modalDetalle.showModal();
      } catch (error) {
        this._notificar("No se pudo consultar el plan.", true);
      }
    }

    cerrarModalDetalle() {
      this.dom.modalDetalle.close();
    }

    /* ---------- Mensajes ---------- */

    _notificar(mensaje, esError) {
      const caja = esError ? this.dom.mensajeError : this.dom.mensajeExito;
      this.dom.mensajeExito.classList.remove("planificador-visible");
      this.dom.mensajeError.classList.remove("planificador-visible");
      caja.textContent = mensaje;
      caja.classList.add("planificador-visible");
      clearTimeout(this.temporizadorMensaje);
      this.temporizadorMensaje = setTimeout(() => {
        caja.classList.remove("planificador-visible");
        caja.textContent = "";
      }, 3500);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.planSemanalApp = new PlanSemanal(window.planSemanalServicio);
  });
})();

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