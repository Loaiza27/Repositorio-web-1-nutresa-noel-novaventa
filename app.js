// Abrir y cerrar el menú lateral (Off-canvas Drawer)
function toggleSidebar() {
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');

  if (drawer.classList.contains('-translate-x-full')) {
    overlay.classList.remove('hidden');
    drawer.classList.remove('-translate-x-full');
  } else {
    drawer.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }
}

// Modal de inspección de planes
function inspectPlan(userId) {
  alert(`Inspeccionando auditoría nutricional para el usuario: ${userId}`);
}

// Modal para crear nuevo plan
function openNewPlanModal() {
  alert('Desplegando flujo para crear un Nuevo Plan Base de Menú...');
}

// Cerrar menú con la tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('mobile-drawer');
    if (!drawer.classList.contains('-translate-x-full')) {
      toggleSidebar();
    }
  }
});