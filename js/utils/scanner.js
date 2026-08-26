// ============================================
// SCANNER - Gestión de escáner de código de barras
// ============================================

const Scanner = {
    active: false,
    targetInput: null,
    scanListeners: [],

    /**
     * Activa el modo de escaneo
     * @param {string} targetId - ID del input destino
     */
    activate(targetId = null) {
        // Si no se especifica, detectar la pantalla activa
        if (!targetId) {
            const screens = {
                'screen-promociones': 'promo-codigo',
                'screen-caducidades': 'cad-codigo',
                'screen-ciclicos': 'ciclico-codigo',
                'screen-inventario': 'inv-manual-codigo'
            };
            
            for (const [screenId, inputId] of Object.entries(screens)) {
                const screen = document.getElementById(screenId);
                if (screen && screen.classList.contains('active')) {
                    targetId = inputId;
                    break;
                }
            }
        }

        if (targetId) {
            this.targetInput = document.getElementById(targetId);
            if (this.targetInput) {
                // Verificar soporte de cámara
                if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
                    this.startScan();
                } else {
                    this.manualScan();
                }
            }
        }
    },

    /**
     * Inicia el escaneo con cámara (simulado)
     */
    startScan() {
        this.active = true;
        
        // Notificar a los listeners
        this.notifyListeners('scanStart', { target: this.targetInput });
        
        // Simular escaneo - En producción usar QuaggaJS
        setTimeout(() => {
            const code = prompt('📷 Escanea el código de barras:\n(Ingresa el código manualmente)');
            if (code && code.trim()) {
                this.targetInput.value = code.trim();
                this.targetInput.dispatchEvent(new Event('input'));
                this.targetInput.dispatchEvent(new Event('change'));
                
                // Notificar escaneo completado
                this.notifyListeners('scanComplete', { 
                    code: code.trim(), 
                    target: this.targetInput 
                });
            }
            this.active = false;
        }, 500);
    },

    /**
     * Escaneo manual (fallback)
     */
    manualScan() {
        this.targetInput.focus();
        this.targetInput.select();
        alert('📷 Escanea el código de barras con la cámara o ingrésalo manualmente.');
    },

    /**
     * Registra un listener para eventos de escaneo
     * @param {Function} callback - Función a ejecutar
     */
    addListener(callback) {
        if (typeof callback === 'function') {
            this.scanListeners.push(callback);
        }
    },

    /**
     * Notifica a todos los listeners
     * @param {string} event - Tipo de evento
     * @param {*} data - Datos del evento
     */
    notifyListeners(event, data) {
        this.scanListeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (e) {
                console.error('Error en listener de escaneo:', e);
            }
        });
    },

    /**
     * Verifica si el dispositivo soporta escaneo
     * @returns {boolean} True si soporta
     */
    isSupported() {
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    }
};

// Exportar para uso global
window.Scanner = Scanner;