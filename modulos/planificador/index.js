(function () {
  class PlanSemanal {
    constructor() {
      this.idUsuarioFiltrado = 1042;
      this.planEnEdicion = null;

      this._cacheDom();
      this._enlazarEventos();
      this.render();
    }

    _cacheDom() {
      this.dom = {
        inputBuscarUsuario: document.getElementById("inputBuscarUsuario"),
        btnBuscar: document.getElementById("btnBuscar"),
        btnCrearPlan: document.getElementById("btnCrearPlan"),
        btnCrearPlanVacio: document.getElementById("btnCrearPlanVacio"),
        contenedorPlanes: document.getElementById("contenedorPlanes"),
        contadorPlanes: document.getElementById("contadorPlanes"),
        modal: document.getElementById("modalPlan"),
        modalTitulo: document.getElementById("modalTitulo"),
        formulario: document.getElementById("formularioPlan"),
        inputId: document.getElementById("inputId"),
        inputIdUsuario: document.getElementById("inputIdUsuario"),
        inputNombre: document.getElementById("inputNombre"),
        inputFechaInicio: document.getElementById("inputFechaInicio"),
        inputFechaFin: document.getElementById("inputFechaFin"),
        inputEstado: document.getElementById("inputEstado"),
        btnCancelar: document.getElementById("btnCancelar"),
        btnGuardar: document.getElementById("btnGuardar"),
        modalDetalle: document.getElementById("modalDetalle"),
        detalleContenido: document.getElementById("detalleContenido"),
        btnCerrarDetalle: document.getElementById("btnCerrarDetalle"),
        toast: document.getElementById("toast")
      };
    }

    _enlazarEventos() {
      if (this.dom.btnCrearPlan) this.dom.btnCrearPlan.addEventListener("click", () => this.abrirModalCreacion());
      if (this.dom.btnCrearPlanVacio) this.dom.btnCrearPlanVacio.addEventListener("click", () => this.abrirModalCreacion());

      if (this.dom.btnBuscar) this.dom.btnBuscar.addEventListener("click", () => this.filtrarPorUsuario());
      if (this.dom.inputBuscarUsuario) {
        this.dom.inputBuscarUsuario.addEventListener("keypress", (e) => {
          if (e.key === "Enter") this.filtrarPorUsuario();
        });
      }

      if (this.dom.formulario) this.dom.formulario.addEventListener("submit", (e) => this._guardarPlan(e));
      if (this.dom.btnCancelar) this.dom.btnCancelar.addEventListener("click", () => this.cerrarModal());
      if (this.dom.btnCerrarDetalle) this.dom.btnCerrarDetalle.addEventListener("click", () => this.cerrarModalDetalle());
    }

    async render() {
      if (!this.dom.contenedorPlanes) return;
      
      const lista = await window.planificadorServicio.listarPorUsuario(this.idUsuarioFiltrado);
      this.dom.contenedorPlanes.innerHTML = "";

      this.dom.contadorPlanes.textContent =
        lista.length === 0 ? "0 planes encontrados" :
        lista.length === 1 ? "1 plan encontrado" : `${lista.length} planes encontrados`;

      lista.forEach((plan) => {
        this.dom.contenedorPlanes.appendChild(this._crearTarjetaPlan(plan));
      });
    }

    _crearTarjetaPlan(plan) {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta-plan";
      tarjeta.dataset.id = plan.id;

      const claseEstado = plan.estado.toLowerCase() === "activo" ? "estado-activo" : "estado-inactivo";

      tarjeta.innerHTML = `
        <span class="tarjeta-estado ${claseEstado}">${plan.estado}</span>
        <h3 class="tarjeta-nombre">${plan.nombre}</h3>
        <div class="tarjeta-fechas">
          <span class="valor">${this._formatearFecha(plan.fechaInicio)} – ${this._formatearFecha(plan.fechaFin)}</span>
        </div>
        <div class="tarjeta-acciones">
          <button class="btn-accion btn-consultar" data-accion="consultar">Consultar</button>
          <button class="btn-accion btn-editar" data-accion="editar">Editar</button>
          <button class="btn-accion btn-eliminar" data-accion="eliminar">Eliminar</button>
        </div>
      `;

      tarjeta.querySelector('[data-accion="consultar"]').addEventListener("click", () => this._abrirDetalle(plan));
      tarjeta.querySelector('[data-accion="editar"]').addEventListener("click", () => this.abrirModalEdicion(plan));
      tarjeta.querySelector('[data-accion="eliminar"]').addEventListener("click", () => this._confirmarEliminar(plan));

      return tarjeta;
    }

    _formatearFecha(fechaIso) {
      if (!fechaIso) return "—";
      const [y, m, d] = fechaIso.split("-");
      return `${d}/${m}/${y}`;
    }

    filtrarPorUsuario() {
      const valor = this.dom.inputBuscarUsuario.value.trim();
      this.idUsuarioFiltrado = valor === "" ? null : parseInt(valor, 10);
      this.render();
    }

    abrirModalCreacion() {
      this.planEnEdicion = null;
      this.dom.modalTitulo.textContent = "Crear plan semanal";
      this.dom.formulario.reset();
      if (this.idUsuarioFiltrado) this.dom.inputIdUsuario.value = this.idUsuarioFiltrado;
      this.dom.modal.classList.add("visible");
    }

    abrirModalEdicion(plan) {
      this.planEnEdicion = plan;
      this.dom.modalTitulo.textContent = `Editar plan #${plan.id}`;
      this.dom.inputId.value = plan.id;
      this.dom.inputIdUsuario.value = plan.idUsuario;
      this.dom.inputNombre.value = plan.nombre;
      this.dom.inputFechaInicio.value = plan.fechaInicio;
      this.dom.inputFechaFin.value = plan.fechaFin;
      this.dom.inputEstado.value = plan.estado;
      this.dom.modal.classList.add("visible");
    }

    cerrarModal() {
      this.dom.modal.classList.remove("visible");
      this.planEnEdicion = null;
    }

    async _guardarPlan(e) {
      if (e) e.preventDefault();

      const datos = {
        idUsuario: this.dom.inputIdUsuario.value,
        nombre: this.dom.inputNombre.value,
        fechaInicio: this.dom.inputFechaInicio.value,
        fechaFin: this.dom.inputFechaFin.value,
        estado: this.dom.inputEstado.value
      };

      if (this.planEnEdicion) {
        await window.planificadorServicio.modificarPlan(this.planEnEdicion.id, datos);
        this._notificar("Plan actualizado correctamente.");
      } else {
        await window.planificadorServicio.crearPlan(datos);
        this._notificar("Plan creado correctamente.");
      }

      this.cerrarModal();
      this.render();
    }

    async _confirmarEliminar(plan) {
      if (confirm(`¿Eliminar el plan "${plan.nombre}"?`)) {
        await window.planificadorServicio.eliminarPlan(plan.id);
        this._notificar("Plan eliminado.");
        this.render();
      }
    }

    _abrirDetalle(plan) {
      const claseEstado = plan.estado.toLowerCase() === "activo" ? "estado-activo" : "estado-inactivo";
      this.dom.detalleContenido.innerHTML = `
        <div class="detalle-fila"><span class="detalle-etiqueta">ID</span><span class="detalle-valor">#${plan.id}</span></div>
        <div class="detalle-fila"><span class="detalle-etiqueta">Nombre</span><span class="detalle-valor">${plan.nombre}</span></div>
        <div class="detalle-fila"><span class="detalle-etiqueta">ID Usuario</span><span class="detalle-valor">${plan.idUsuario}</span></div>
        <div class="detalle-fila"><span class="detalle-etiqueta">Fecha inicio</span><span class="detalle-valor">${this._formatearFecha(plan.fechaInicio)}</span></div>
        <div class="detalle-fila"><span class="detalle-etiqueta">Fecha fin</span><span class="detalle-valor">${this._formatearFecha(plan.fechaFin)}</span></div>
        <div class="detalle-fila"><span class="detalle-etiqueta">Estado</span><span class="detalle-valor"><span class="tarjeta-estado ${claseEstado}">${plan.estado}</span></span></div>
      `;
      this.dom.modalDetalle.classList.add("visible");
    }

    cerrarModalDetalle() {
      this.dom.modalDetalle.classList.remove("visible");
    }

    _notificar(mensaje) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = mensaje;
      this.dom.toast.className = "toast visible";
      setTimeout(() => { this.dom.toast.className = "toast"; }, 3000);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.planSemanalApp = new PlanSemanal();
  });
})();

