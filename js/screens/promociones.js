// ============================================
// PROMOCIONES - Tu sistema NETO integrado
// ============================================

const PromocionesNETO = {
    estiloSeleccionado: 'coca',
    deferredPrompt: null,

    // ========== CONFIGURACIÓN ==========
    palabrasClave: ['leche', 'yogurt', 'yogur', 'cereal', 'jabon', 'jabón', 'shampoo', 'champu', 'champú', 'queso', 'crema', 'jamón', 'jamon', 'galletas', 'pan', 'comida', 'jugo', 'refresco', 'bebida', 'detergente', 'suavizante'],
    numeroWhatsApp: '522217709192',
    
    presetsEstilos: {
        coca: "Estilo publicitario icónico y refrescante tipo Coca-Cola: Gotas de condensación helada en el envase, cubos de hielo traslúcidos alrededor, destellos de luz, fondo rojo vibrante y atmósfera fría ultra tentadora.",
        botanero: "Estilo festivo y enérgico para botanas y promociones 3x2: Colores cálidos y amarillos/naranjas saturados, chispeante, composición dinámica con botanas o elementos volando alegremente en el fondo.",
        frescura: "Estilo ultra limpio para lácteos y productos frescos: Fondo blanco suave con tonos azul pastel, ondas o salpicaduras suaves de frescura, sensación de calidad del campo y saludabilidad.",
        estudio: "Estilo comercial elegante tipo producto de cuidado personal: Luz de estudio fotográfico suave y difusa, fondo neutro con sombras sutiles, destellos higiénicos y apariencia premium de alta gama.",
        remate: "Estilo de alto impacto visual para remates relámpago: Cartel promocional vibrante con luces neón, tonos fuego/fucsia, etiquetas de descuento gigantes y sentido de oportunidad imperdible.",
        clasico: "Estilo anuncio comercial directo tipo Súper NETO: Fotografía de producto nítida sobre mostrador impecable, iluminación comercial brillante en azul rey y naranja, enfoque total en la etiqueta y claridad en la oferta."
    },

    // ========== INICIALIZACIÓN ==========
    init() {
        this.setupEventListeners();
        this.setupPWA();
        this.cargarPromocionesGuardadas();
    },

    // ========== EVENT LISTENERS ==========
    setupEventListeners() {
        const nombreInput = document.getElementById('prodNombre');
        const checkPerecedero = document.getElementById('checkPerecedero');
        const fotoInput = document.getElementById('prodFoto');

        // Detectar productos perecederos
        if (nombreInput) {
            nombreInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase();
                const requiere = this.palabrasClave.some(p => val.includes(p));
                const campoVencimiento = document.getElementById('campoVencimiento');
                if (requiere) {
                    campoVencimiento.classList.remove('hidden');
                    checkPerecedero.checked = true;
                } else if (!checkPerecedero.checked) {
                    campoVencimiento.classList.add('hidden');
                }
            });
        }

        // Toggle vencimiento
        if (checkPerecedero) {
            checkPerecedero.addEventListener('change', (e) => {
                const campoVencimiento = document.getElementById('campoVencimiento');
                if (e.target.checked) {
                    campoVencimiento.classList.remove('hidden');
                } else {
                    campoVencimiento.classList.add('hidden');
                }
            });
        }

        // Vista previa de foto
        if (fotoInput) {
            fotoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        const imgPreview = document.getElementById('imgPreview');
                        const fotoNombre = document.getElementById('fotoNombre');
                        const previewContainer = document.getElementById('previewContainer');
                        imgPreview.src = evt.target.result;
                        fotoNombre.textContent = file.name;
                        previewContainer.classList.remove('hidden');
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    },

    // ========== PWA ==========
    setupPWA() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('btnInstalarApp');
            if (btn) {
                btn.classList.add('animate-bounce');
            }
        });
    },

    // ========== SELECCIONAR ESTILO ==========
    seleccionarEstilo(btn, estilo) {
        document.querySelectorAll('.promo-card').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.estiloSeleccionado = estilo;
    },

    // ========== GENERAR PROMPT ==========
    generarPrompt() {
        const nombre = document.getElementById('prodNombre').value.trim();
        const precio = document.getElementById('prodPrecio').value.trim();
        const existencia = document.getElementById('prodExistencia').value.trim();
        const vencimiento = document.getElementById('prodVencimiento').value;
        const tieneFoto = document.getElementById('prodFoto').files.length > 0;

        if (!nombre || !precio) {
            this.mostrarToast('Ingresa el Nombre del producto y la Oferta/Precio.', '⚠️');
            return;
        }

        let promptText = `Hola colega, genera una imagen publicitaria profesional de alta calidad para mi tienda con la siguiente información:\n\n`;
        promptText += `• Producto: ${nombre}\n`;
        promptText += `• Oferta / Precio: ${precio}\n`;
        
        if (existencia) {
            promptText += `• Stock disponible: ${existencia} piezas\n`;
        }

        const checkPerecedero = document.getElementById('checkPerecedero');
        if (checkPerecedero.checked && vencimiento) {
            promptText += `• Fecha de vencimiento: ${vencimiento}\n`;
        }

        if (tieneFoto) {
            promptText += `• [Nota: Te adjunto la foto real del producto como referencia visual para conservar la etiqueta original]\n`;
        }

        promptText += `\n🎨 Tema y Estilo Visual Solicitado:\n${this.presetsEstilos[this.estiloSeleccionado]}\n`;
        promptText += `\nPor favor integra el texto promocional "${precio}" de forma llamativa, legible y estética dentro del diseño publicitario.`;

        // Guardar en localStorage
        this.guardarPromocion(nombre, precio, existencia, vencimiento, promptText);

        document.getElementById('promptResult').value = promptText;
        document.getElementById('outputSection').classList.remove('hidden');
        document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
        this.mostrarToast('¡Prompt generado con éxito!', '✨');
    },

    // ========== GUARDAR PROMOCIÓN ==========
    guardarPromocion(nombre, precio, existencia, vencimiento, prompt) {
        const promociones = Storage.get('promociones');
        promociones.push({
            id: Date.now(),
            nombre: nombre,
            precio: precio,
            existencia: existencia || 0,
            vencimiento: vencimiento || null,
            prompt: prompt,
            estilo: this.estiloSeleccionado,
            fecha: new Date().toLocaleDateString()
        });
        Storage.set('promociones', promociones);
        this.cargarPromocionesGuardadas();
        document.dispatchEvent(new Event('dataChanged'));
    },

    // ========== CARGAR PROMOCIONES GUARDADAS ==========
    cargarPromocionesGuardadas() {
        const promociones = Storage.get('promociones');
        const lista = document.getElementById('promo-lista');
        const count = document.getElementById('promo-count');
        const badge = document.getElementById('badge-promo');
        
        if (count) count.textContent = promociones.length;
        if (badge) badge.textContent = promociones.length;
        
        if (promociones.length === 0) {
            if (lista) lista.innerHTML = '<p class="empty-message">No hay promociones guardadas</p>';
            return;
        }

        let html = '';
        promociones.slice().reverse().forEach((p, index) => {
            html += `
                <div class="product-list-item" style="border-left-color: var(--primary-orange);">
                    <div class="product-info">
                        <div class="name">${this.escapeHtml(p.nombre)}</div>
                        <div class="barcode" style="font-size: 11px; color: #666;">
                            <i class="fas fa-tag"></i> ${this.escapeHtml(p.precio)}
                            ${p.existencia ? ` · ${p.existencia} uds` : ''}
                        </div>
                        <div style="font-size: 10px; color: #888;">
                            ${p.fecha || ''}
                            ${p.vencimiento ? ` · 🗓️ ${p.vencimiento}` : ''}
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-sm" onclick="PromocionesNETO.verPrompt(${index})" title="Ver prompt">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="PromocionesNETO.eliminar(${index})" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        if (lista) lista.innerHTML = html;
    },

    // ========== VER PROMPT ==========
    verPrompt(index) {
        const promociones = Storage.get('promociones');
        const p = promociones[index];
        if (p && p.prompt) {
            document.getElementById('promptResult').value = p.prompt;
            document.getElementById('outputSection').classList.remove('hidden');
            document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
            this.mostrarToast('Prompt cargado', '📋');
        }
    },

    // ========== ELIMINAR ==========
    eliminar(index) {
        if (!confirm('¿Eliminar esta promoción?')) return;
        const promociones = Storage.get('promociones');
        promociones.splice(index, 1);
        Storage.set('promociones', promociones);
        this.cargarPromocionesGuardadas();
        document.dispatchEvent(new Event('dataChanged'));
        this.mostrarToast('Promoción eliminada', '🗑️');
    },

    // ========== COPIAR PROMPT ==========
    copiarPrompt() {
        const txt = document.getElementById('promptResult');
        if (!txt.value) {
            this.mostrarToast('No hay prompt para copiar', '⚠️');
            return;
        }
        txt.select();
        navigator.clipboard.writeText(txt.value).then(() => {
            this.mostrarToast('¡Prompt copiado al portapapeles!', '📋');
        }).catch(() => {
            // Fallback
            document.execCommand('copy');
            this.mostrarToast('¡Prompt copiado!', '📋');
        });
    },

    // ========== ENVIAR WHATSAPP ==========
    enviarWhatsApp() {
        const promptText = document.getElementById('promptResult').value;
        if (!promptText) {
            this.mostrarToast('Genera un prompt primero', '⚠️');
            return;
        }
        const url = `https://wa.me/${this.numeroWhatsApp}?text=${encodeURIComponent(promptText)}`;
        window.open(url, '_blank');
    },

    // ========== INSTALAR APP ==========
    async instalarApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.mostrarToast('¡Gracias por instalar la App!', '✅');
            }
            this.deferredPrompt = null;
        } else {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                this.mostrarToast('📲 Para iPhone: Toca "Compartir" (📤 en Safari) y selecciona "Agregar al inicio" ➕', '📱');
            } else {
                this.mostrarToast('📲 En tu navegador toca el menú de 3 puntos (⋮) y selecciona "Instalar aplicación"', '📱');
            }
        }
    },

    // ========== TOAST ==========
    mostrarToast(mensaje, icono = 'ℹ️') {
        // Usar el mismo sistema de toast que en tu versión
        const container = document.getElementById('toastContainer');
        if (container) {
            const msg = document.getElementById('toastMessage');
            const icn = document.getElementById('toastIcon');
            
            if (msg) msg.textContent = mensaje;
            if (icn) icn.textContent = icono;

            container.classList.remove('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
            
            setTimeout(() => {
                container.classList.add('opacity-0', 'translate-y-[-20px]', 'pointer-events-none');
            }, 4000);
        } else {
            // Fallback
            alert(mensaje);
        }
    },

    // ========== ESCAPE HTML ==========
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ========== MOSTRAR PANTALLA ==========
    show() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-promociones').classList.add('active');
        this.cargarPromocionesGuardadas();
        
        const fab = document.getElementById('fabScan');
        if (fab) fab.classList.add('show');
    }
};

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.PromocionesNETO = PromocionesNETO;

// Funciones para usar desde HTML
window.seleccionarEstilo = (btn, estilo) => PromocionesNETO.seleccionarEstilo(btn, estilo);
window.generarPrompt = () => PromocionesNETO.generarPrompt();
window.copiarPrompt = () => PromocionesNETO.copiarPrompt();
window.enviarWhatsApp = () => PromocionesNETO.enviarWhatsApp();
window.instalarApp = () => PromocionesNETO.instalarApp();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    PromocionesNETO.init();
});