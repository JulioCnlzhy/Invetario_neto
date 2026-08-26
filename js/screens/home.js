// ============================================
// HOME - Pantalla de inicio
// ============================================

const Home = {
    /**
     * Inicializa la pantalla de inicio
     */
    init() {
        this.updateBadges();
        this.setupListeners();
    },

    /**
     * Actualiza los badges del menú
     */
    updateBadges() {
        const promociones = Storage.get('promociones');
        const caducidades = Storage.get('caducidades');
        
        const promoBadge = document.getElementById('badge-promo');
        const cadBadge = document.getElementById('badge-cad');
        
        if (promoBadge) promoBadge.textContent = promociones.length;
        if (cadBadge) cadBadge.textContent = caducidades.length;
    },

    /**
     * Configura los listeners de la pantalla
     */
    setupListeners() {
        // Escuchar cambios en los datos
        document.addEventListener('dataChanged', () => {
            this.updateBadges();
        });
    },

    /**
     * Muestra la pantalla de inicio
     */
    show() {
        this.updateBadges();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-home').classList.add('active');
        
        // Mostrar FAB
        const fab = document.getElementById('fabScan');
        if (fab) fab.classList.add('show');
    }
};

// Exportar para uso global
window.Home = Home;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Home.init();
});