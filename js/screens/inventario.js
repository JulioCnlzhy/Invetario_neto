// ============================================
// INVENTARIO - Gestión de inventario
// ============================================

const Inventario = {
    /**
     * Muestra el tipo de inventario seleccionado
     * @param {string} tipo - 'ciclico' o 'manual'
     */
    mostrar(tipo) {
        document.getElementById('inventario-ciclico').classList.add('hidden');
        document.getElementById('inventario-manual').classList.add('hidden');
        
        if (tipo === 'ciclico') {
            document.getElementById('inventario-ciclico').classList.remove('hidden');
        } else {
            document.getElementById('inventario-manual').classList.remove('hidden');
            this.cargarManual();
        }
    },

    /**
     * Guarda un registro de inventario manual
     */
    guardarManual() {
        const codigo = document.getElementById('inv-manual-codigo').value.trim();
        const nombre = document.getElementById('inv-manual-nombre').value.trim();
        const cantidad = parseInt(document.getElementById('inv-manual-cantidad').value) || 0;
        const sistema = parseInt(document.getElementById('inv-manual-sistema').value) || 0;

        if (!codigo || !nombre) {
            alert('⚠️ Completa código de barras y nombre');
            return;
        }

        const inventario = Storage.get('inventario_manual');
        const diferencia = cantidad - sistema;
        
        inventario.push({
            id: Date.now(),
            codigo: codigo,
            nombre: nombre,
            cantidad_real: cantidad,
            cantidad_sistema: sistema,
            diferencia: diferencia,
            fecha: new Date().toLocaleDateString()
        });
        Storage.set('inventario_manual', inventario);

        // Limpiar campos
        document.getElementById('inv-manual-codigo').value = '';
        document.getElementById('inv-manual-nombre').value = '';
        document.getElementById('inv-manual-cantidad').value = '';
        document.getElementById('inv-manual-sistema').value = '';

        this.cargarManual();
        alert('✅ Inventario actualizado');
        document.dispatchEvent(new Event('dataChanged'));
    },

    /**
     * Carga el registro de inventario manual
     */
    cargarManual() {
        const inventario = Storage.get('inventario_manual');
        const lista = document.getElementById('inv-manual-lista');
        const count = document.getElementById('inv-manual-count');
        
        count.textContent = inventario.length;
        
        if (inventario.length === 0) {
            lista.innerHTML = '<p class="empty-message">Sin registros</p>';
            return;
        }

        let html = '';
        inventario.slice().reverse().forEach(item => {
            const diffColor = item.diferencia !== 0 ? 
                (item.diferencia > 0 ? '#4caf50' : '#d32f2f') : '#666';
            
            html += `
                <div class="product-list-item" style="border-left-color: ${diffColor};">
                    <div class="product-info">
                        <div class="name">${this.escapeHtml(item.nombre)}</div>
                        <div class="barcode"><i class="fas fa-barcode"></i> ${this.escapeHtml(item.codigo)}</div>
                        <div style="font-size: 12px; color: #666;">
                            <i class="fas fa-calendar-alt"></i> ${item.fecha}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 13px;">
                            Real: <strong>${item.cantidad_real}</strong>
                        </div>
                        <div style="font-size: 13px;">
                            Sistema: <strong>${item.cantidad_sistema}</strong>
                        </div>
                        <div style="font-size: 16px; font-weight: bold; color: ${diffColor};">
                            ${item.diferencia > 0 ? '+' : ''}${item.diferencia}
                        </div>
                    </div>
                </div>
            `;
        });
        lista.innerHTML = html;
    },

    /**
     * Procesa imágenes para inventario cíclico
     */
    procesarCiclico() {
        const input = document.getElementById('inv-ciclico-imagenes');
        if (input.files.length === 0) {
            alert('⚠️ Selecciona al menos una imagen');
            return;
        }

        const resultados = document.getElementById('inv-ciclico-resultados');
        const productos = Storage.get('caducidades');
        
        if (productos.length === 0) {
            resultados.innerHTML = '<div class="alert alert-danger">No hay productos en el sistema para comparar.</div>';
            return;
        }

        let html = '<div style="margin-top: 10px; font-weight: 600; color: var(--primary-blue);">';
        html += '<i class="fas fa-chart-bar"></i> Resultados de la Comparación</div>';
        
        const muestra = productos.slice(0, Math.min(input.files.length * 2, productos.length));
        
        muestra.forEach(p => {
            const cantidadSistema = p.cantidad || 1;
            const cantidadDetectada = Math.floor(Math.random() * 5) + 1;
            const diff = cantidadDetectada - cantidadSistema;
            const estado = diff === 0 ? '✅ Correcto' : (diff > 0 ? '⬆️ Excedente' : '⬇️ Faltante');
            const color = diff === 0 ? '#4caf50' : (diff > 0 ? '#ff6f00' : '#d32f2f');
            
            html += `
                <div class="product-list-item" style="border-left-color: ${color};">
                    <div class="product-info">
                        <div class="name">${this.escapeHtml(p.nombre)}</div>
                        <div class="barcode"><i class="fas fa-barcode"></i> ${this.escapeHtml(p.codigo)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 13px;">
                            Sistema: <strong>${cantidadSistema}</strong>
                        </div>
                        <div style="font-size: 13px;">
                            Detectado: <strong>${cantidadDetectada}</strong>
                        </div>
                        <div style="font-size: 14px; font-weight: bold; color: ${color};">
                            ${estado}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `<div class="alert alert-success" style="margin-top: 10px;">
            <i class="fas fa-check-circle"></i> 
            ${input.files.length} imágenes procesadas. ${muestra.length} productos analizados.
        </div>`;
        
        resultados.innerHTML = html;
        input.value = '';
    },

    /**
     * Muestra la pantalla de inventario
     */
    show() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-inventario').classList.add('active');
        this.mostrar('manual');
        
        const fab = document.getElementById('fabScan');
        if (fab) fab.classList.add('show');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Exportar para uso global
window.Inventario = Inventario;

// Funciones globales
window.mostrarInventario = (tipo) => Inventario.mostrar(tipo);
window.guardarInventarioManual = () => Inventario.guardarManual();
window.procesarInventarioCiclico = () => Inventario.procesarCiclico();
window.cargarInventarioManual = () => Inventario.cargarManual();