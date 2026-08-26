// ============================================
// CICLICOS - Conteo cíclico
// ============================================

const Ciclicos = {
    productos: [],

    /**
     * Busca un producto por código de barras
     */
    buscar() {
        const codigo = document.getElementById('ciclico-codigo').value.trim();
        if (!codigo) {
            alert('⚠️ Escanea o ingresa un código de barras');
            return;
        }

        // Buscar en promociones y caducidades
        const promociones = Storage.get('promociones');
        const caducidades = Storage.get('caducidades');
        
        let encontrado = null;
        
        for (let p of promociones) {
            if (p.codigo === codigo) {
                encontrado = { nombre: p.nombre, codigo: p.codigo };
                break;
            }
        }
        
        if (!encontrado) {
            for (let c of caducidades) {
                if (c.codigo === codigo) {
                    encontrado = { nombre: c.nombre, codigo: c.codigo };
                    break;
                }
            }
        }

        if (encontrado) {
            this.agregar(encontrado.codigo, encontrado.nombre);
        } else {
            const nombre = prompt('Producto no encontrado. Ingresa el nombre:');
            if (nombre && nombre.trim()) {
                this.agregar(codigo, nombre.trim());
            }
        }
    },

    /**
     * Agrega un producto a la lista de conteo
     * @param {string} codigo - Código de barras
     * @param {string} nombre - Nombre del producto
     */
    agregar(codigo, nombre) {
        if (this.productos.some(p => p.codigo === codigo)) {
            alert('⚠️ Este producto ya está en la lista');
            return;
        }

        this.productos.push({
            codigo: codigo,
            nombre: nombre,
            cantidad: 0
        });

        this.mostrar();
        document.getElementById('ciclico-codigo').value = '';
    },

    /**
     * Muestra la lista de productos en conteo
     */
    mostrar() {
        const lista = document.getElementById('ciclico-lista');
        const btnGuardar = document.getElementById('btn-guardar-ciclico');
        const count = document.getElementById('ciclico-count');
        
        count.textContent = this.productos.length;
        
        if (this.productos.length === 0) {
            lista.innerHTML = '<p class="empty-message">Los productos aparecerán aquí después de escanear</p>';
            btnGuardar.classList.add('hidden');
            return;
        }

        btnGuardar.classList.remove('hidden');
        let html = '';
        this.productos.forEach((p, index) => {
            html += `
                <div class="product-list-item" style="border-left-color: var(--primary-orange);">
                    <div class="product-info">
                        <div class="name">${this.escapeHtml(p.nombre)}</div>
                        <div class="barcode"><i class="fas fa-barcode"></i> ${this.escapeHtml(p.codigo)}</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-sm" onclick="Ciclicos.cambiarCantidad(${index}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="count-display">${p.cantidad}</span>
                        <button class="btn btn-secondary btn-sm" onclick="Ciclicos.cambiarCantidad(${index}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="Ciclicos.eliminar(${index})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        lista.innerHTML = html;
    },

    /**
     * Cambia la cantidad de un producto
     * @param {number} index - Índice del producto
     * @param {number} delta - Cambio en la cantidad
     */
    cambiarCantidad(index, delta) {
        this.productos[index].cantidad = Math.max(0, this.productos[index].cantidad + delta);
        this.mostrar();
    },

    /**
     * Elimina un producto de la lista
     * @param {number} index - Índice del producto
     */
    eliminar(index) {
        this.productos.splice(index, 1);
        this.mostrar();
    },

    /**
     * Procesa imágenes para detectar productos
     */
    procesarImagenes() {
        const input = document.getElementById('ciclico-imagenes');
        if (input.files.length === 0) {
            alert('⚠️ Selecciona al menos una imagen');
            return;
        }

        // Simular detección de códigos de barras
        const codigosEjemplo = [
            { codigo: '7501001234567', nombre: 'Producto Detectado 1' },
            { codigo: '7501001234568', nombre: 'Producto Detectado 2' },
            { codigo: '7501001234569', nombre: 'Producto Detectado 3' }
        ];

        let agregados = 0;
        for (let i = 0; i < input.files.length && i < codigosEjemplo.length; i++) {
            const p = codigosEjemplo[i];
            if (!this.productos.some(item => item.codigo === p.codigo)) {
                this.productos.push({
                    codigo: p.codigo,
                    nombre: p.nombre + ' 📸',
                    cantidad: 0
                });
                agregados++;
            }
        }

        this.mostrar();
        input.value = '';
        alert(`✅ ${input.files.length} imágenes procesadas. ${agregados} productos detectados.`);
    },

    /**
     * Guarda el conteo cíclico
     */
    guardar() {
        if (this.productos.length === 0) {
            alert('⚠️ No hay productos para guardar');
            return;
        }

        const conteos = Storage.get('conteos_ciclicos');
        conteos.push({
            fecha: new Date().toISOString(),
            productos: JSON.parse(JSON.stringify(this.productos))
        });
        Storage.set('conteos_ciclicos', conteos);

        alert('✅ Conteo guardado exitosamente');
        this.productos = [];
        this.mostrar();
        document.dispatchEvent(new Event('dataChanged'));
    },

    /**
     * Muestra la pantalla de cíclicos
     */
    show() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-ciclicos').classList.add('active');
        this.mostrar();
        
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
window.Ciclicos = Ciclicos;

// Funciones globales
window.buscarProductoCiclico = () => Ciclicos.buscar();
window.procesarImagenesCiclico = () => Ciclicos.procesarImagenes();
window.guardarConteoCiclico = () => Ciclicos.guardar();
window.cambiarCantidadCiclico = (index, delta) => Ciclicos.cambiarCantidad(index, delta);