document.getElementById('formListaMercado').addEventListener('submit', function(e) {
    e.preventDefault();

    
    const nombre = document.getElementById('nombre').value;
    const presupuesto = parseFloat(document.getElementById('presupuesto').value);
    const idPlanSemanal = parseInt(document.getElementById('idPlanSemanal').value);
    
    
    const fechaCreacion = new Date().toISOString().split('T')[0];

    
    const nuevaListaMercado = {
        id: null,
        nombre: nombre,
        fechaCreacion: fechaCreacion,
        presupuesto: presupuesto,
        completada: false, // Inicia incompleta por defecto
        idPlanSemanal: idPlanSemanal
    };

    
    console.log("=== PAYLOAD CAPTURADO EN FRONTEND (Mód. Planificador) ===");
    console.log(JSON.stringify(nuevaListaMercado, null, 2));

    
    const mensaje = document.getElementById('mensajeExito');
    mensaje.classList.remove('oculto');
    setTimeout(() => mensaje.classList.add('oculto'), 3500);

    
    this.reset();
});