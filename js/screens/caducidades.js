// ============================================
// CADUCIDADES - Gestión de caducidades
// ============================================

const Caducidades = {
    /**
     * Guarda un nuevo producto con caducidad
     */
    guardar() {
        const codigo = document.getElementById('cad-codigo').value.trim();
        const nombre = document.getElementById('cad-nombre').value.trim();
        const fecha = document.getElementById('cad-fecha').value;
        const cantidad = parseInt(document.getElementById('cad-cantidad').value) || 1;

        if (!codigo || !nombre || !fecha) {
            alert('⚠️ Completa código de barras, nombre y fecha de caducidad.');
            return;
        }

        const caducidades = Storage.get('caducidades');
        caducidades.push({
            id: Date.now(),
            codigo: codigo,
            nombre: nombre,
            fecha: fecha,
            cantidad: cantidad,
            fecha_registro: new Date().toISOString()
        });
        
        Storage.set('caducidades', caducidades);

        // Limpiar campos
        document.getElementById('cad-codigo').value = '';
        document.getElementById('cad-nombre').value = '';
        document.getElementById('cad-fecha').value = '';
        document.getElementById('cad-cantidad').value = '1';

        this.cargar();
        alert('✅ Producto registrado correctamente');
        document.dispatchEvent(new Event('dataChanged'));
    },

    /**
     * Carga la lista de productos con caducidad
     */
    cargar() {
        const caducidades = Storage.get('caducidades');
        const lista = document.getElementById('cad-lista');
        const count = document.getElementById('cad-count');
        const badge = document.getElementById('badge-cad');
        
        count.textContent = caducidades.length;
        if (badge) badge.textContent = caducidades.length;
        
        if (caducidades.length === 0) {
            lista.innerHTML = '<p class="empty-message">No hay productos registrados</p>';
            return;
        }

        // Ordenar por fecha de caducidad
        const sorted = [...caducidades].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        let html = '';
        sorted.forEach(item => {
            const fechaCad = new Date(item.fecha);
            const diffTime = fechaCad - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let badgeClass = 'badge-success';
            let estado = '✅ Vigente';
            let borderColor = 'var(--primary-blue)';
            
            if (diffDays < 0) {
                badgeClass = 'badge-danger';
                estado = '❌ Caducado';
                borderColor = '#d32f2f';
            } else if (diffDays <= 7) {
                badgeClass = 'badge-danger';
                estado = '⚠️ Urgente';
                borderColor = '#ff6f00';
            } else if (diffDays <= 30) {
                badgeClass = 'badge-warning';
                estado = '⏰ Próximo';
                borderColor = '#ff6f00';
            }

            html += `
                <div class="product-list-item" style="border-left-color: ${borderColor};">
                    <div class="product-info">
                        <div class="name">${this.escapeHtml(item.nombre)}</div>
                        <div class="barcode"><i class="fas fa-barcode"></i> ${this.escapeHtml(item.codigo)}</div>
                        <div style="font-size: 12px; color: #666;">
                            <i class="fas fa-calendar-alt"></i> ${item.fecha} · ${item.cantidad} unidades
                            <span style="margin-left: 8px; font-size: 11px;">
                                (${diffDays} días)
                            </span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge ${badgeClass}">${estado}</span>
                        <button class="btn btn-danger btn-sm" onclick="Caducidades.eliminar('${item.id}')" style="margin-top: 4px;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        lista.innerHTML = html;
    },

    /**
     * Elimina un producto por ID
     * @param {string|number} id - ID del producto
     */
    eliminar(id) {
        if (!confirm('¿Eliminar este producto?')) return;
        const caducidades = Storage.get('caducidades');
        const index = caducidades.findIndex(item => item.id === id);
        if (index !== -1) {
            caducidades.splice(index, 1);
            Storage.set('caducidades', caducidades);
            this.cargar();
            document.dispatchEvent(new Event('dataChanged'));
        }
    },

    /**
     * Muestra la pantalla de caducidades
     */
    show() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-caducidades').classList.add('active');
        this.cargar();
        
        const fab = document.getElementById('fabScan');
        if (fab) fab.classList.add('show');
    },

    /**
     * Escapa caracteres HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Exportar para uso global
window.Caducidades = Caducidades;

// Funciones globales para compatibilidad
window.guardarCaducidad = () => Caducidades.guardar();
window.cargarCaducidades = () => Caducidades.cargar();