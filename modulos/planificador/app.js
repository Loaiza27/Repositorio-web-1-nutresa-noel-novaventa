// ===== G5-LIS · inicio =====
document.addEventListener('DOMContentLoaded', () => {
    const formLista = document.getElementById('listamercado-form');
    if (!formLista) return; 

    const selectPlan = document.getElementById('listamercado-idPlanSemanal');
    const mensajeContenedor = document.getElementById('listamercado-mensaje');

    const mostrarMensaje = (texto, tipo) => {
        mensajeContenedor.textContent = texto;
        mensajeContenedor.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
        mensajeContenedor.className = tipo === 'error' ? 'listamercado-alerta-error' : 'listamercado-alerta-exito';
        mensajeContenedor.style.display = 'block';
        setTimeout(() => {
            mensajeContenedor.style.display = 'none';
        }, 4000);
    };

    const cargarPlanesSemanales = async () => {
        try {
            const planes = await window.planSemanalServicio.listarTodos(); 
            
            selectPlan.innerHTML = '<option value="">Seleccione un plan...</option>';
            
            if (planes && planes.length > 0) {
                planes.forEach((plan) => {
                    const opcion = document.createElement("option");
                    opcion.value = plan.id;
                    opcion.textContent = plan.nombre;
                    selectPlan.append(opcion);
                });
            } else {
                selectPlan.innerHTML = '<option value="">No hay planes creados aún</option>';
            }
        } catch (error) {
            console.error(error);
            selectPlan.innerHTML = '<option value="">Error al cargar planes</option>';
        }
    };

    cargarPlanesSemanales();

    formLista.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('listamercado-nombre').value.trim();
        const presupuestoRaw = document.getElementById('listamercado-presupuesto').value;
        const idPlanSemanal = document.getElementById('listamercado-idPlanSemanal').value;

        const presupuesto = parseFloat(presupuestoRaw);
        if (!nombre || isNaN(presupuesto) || presupuesto <= 0 || !idPlanSemanal) {
            mostrarMensaje("Faltan datos. El presupuesto debe ser válido y mayor a 0.", "error");
            return;
        }

        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        const fechaCreacionLocal = `${year}-${month}-${day}`; 

        const nuevaListaMercado = {
            id: null,
            nombre: nombre,
            fechaCreacion: fechaCreacionLocal,
            presupuesto: presupuesto,
            completada: false,
            idPlanSemanal: parseInt(idPlanSemanal)
        };

        try {
            await window.listaMercadoServicio.crear(nuevaListaMercado);
            console.log("=== Payload Guardado ===", nuevaListaMercado);
            mostrarMensaje("¡Lista de mercado creada con éxito!", "exito");
            formLista.reset();
        } catch (error) {
            console.error(error);
            mostrarMensaje("Ocurrió un error al intentar guardar la lista.", "error");
        }
    });
});
// ===== G5-LIS · fin =====