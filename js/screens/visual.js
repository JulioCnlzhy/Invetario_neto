// ============================================
// VISUAL - Visualización general
// ============================================

const Visual = {
    /**
     * Actualiza la visualización general
     */
    actualizar() {
        const caducidades = Storage.get('caducidades');
        const promociones = Storage.get('promociones');
        const inventario = Storage.get('inventario_manual');
        
        // Total de productos
        document.getElementById('vis-total-productos').textContent = caducidades.length;
        
        // Productos por caducar (30 días)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const treintaDias = new Date(hoy);
        treintaDias.setDate(treintaDias.getDate() + 30);
        
        const porCaducar = caducidades.filter(c => {
            const fecha = new Date(c.fecha);
            return fecha >= hoy && fecha <= treintaDias;
        });
        document.getElementById('vis-caducando').textContent = porCaducar.length;
        
        // Promociones
        document.getElementById('vis-promociones').textContent = promociones.length;
        
        // Productos recientes
        this.mostrarRecientes();
    },

    /**
     * Muestra los productos más recientes
     */
    mostrarRecientes() {
        const caducidades = Storage.get('caducidades');
        const lista = document.getElementById('vis-productos-recientes');
        
        if (caducidades.length === 0) {
            lista.innerHTML = '<p class="empty-message">No hay productos registrados</p>';
            return;
        }
        
        let html = '';
        const recientes = caducidades.slice(-5).reverse();
        recientes.forEach(p => {
            const fecha = new Date(p.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const diff = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
            
            let badgeClass = 'badge-success';
            let estado = '✅ Vigente';
            if (diff < 0) {
                badgeClass = 'badge-danger';
                estado = '❌ Caducado';
            } else if (diff <= 7) {
                badgeClass = 'badge-danger';
                estado = '⚠️ Urgente';
            } else if (diff <= 30) {
                badgeClass = 'badge-warning';
                estado = '⏰ Próximo';
            }
            
            html += `
                <div class="product-list-item" style="border-left-color: ${diff < 0 ? '#d32f2f' : diff <= 7 ? '#ff6f00' : '#1a237e'};">
                    <div class="product-info">
                        <div class="name">${this.escapeHtml(p.nombre)}</div>
                        <div class="barcode"><i class="fas fa-barcode"></i> ${this.escapeHtml(p.codigo)}</div>
                        <div style="font-size: 12px; color: #666;">
                            <i class="fas fa-calendar-alt"></i> ${p.fecha} · ${p.cantidad} uds
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge ${badgeClass}">${estado}</span>
                    </div>
                </div>
            `;
        });
        lista.innerHTML = html;
    },

    /**
     * Muestra la pantalla de visualización
     */
    show() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-visual').classList.add('active');
        this.actualizar();
        
        const fab = document.getElementById('fabScan');
        if (fab) fab.classList.remove('show');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Exportar para uso global
window.Visual = Visual;
window.actualizarVisual = () => Visual.actualizar();

// Funciones globales
window.actualizarVisual = () => Visual.actualizar();