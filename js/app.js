// ============================================
// APP - Aplicación principal
// ============================================

const App = {
    /**
     * Inicializa la aplicación
     */
    init() {
        console.log('📦 Sistema de Inventario - Código de Barras');
        console.log('📷 Usa el botón flotante para escanear');
        console.log('💾 Datos guardados en localStorage');
        console.log('📁 Repositorio:', window.repoPath || '/');
        
        // Configurar navegación
        this.setupNavigation();
        
        // Configurar escáner
        this.setupScanner();
        
        // Inicializar pantalla de inicio
        if (typeof Home !== 'undefined' && Home.init) {
            Home.init();
        } else {
            console.warn('⚠️ Home no está definido');
        }
        
        // Escuchar cambios en los datos
        document.addEventListener('dataChanged', () => {
            if (typeof Home !== 'undefined' && Home.updateBadges) {
                Home.updateBadges();
            }
            if (document.getElementById('screen-visual') && 
                document.getElementById('screen-visual').classList.contains('active')) {
                if (typeof Visual !== 'undefined' && Visual.actualizar) {
                    Visual.actualizar();
                }
            }
        });
        
        // Detectar Android para optimización
        if (/android/i.test(navigator.userAgent)) {
            document.body.classList.add('android-performance');
        }
        
        // Atajo: Enter en campos de código de barras
        this.setupBarcodeShortcuts();
        
        // Cargar datos iniciales
        this.cargarDatosIniciales();
    },

    /**
     * Configura la navegación entre pantallas
     */
    setupNavigation() {
        // Esta función se llama desde el HTML con onclick
        window.showScreen = (screenId) => {
            console.log('🔄 Navegando a:', screenId);
            
            const screens = {
                'home': () => {
                    if (typeof Home !== 'undefined' && Home.show) {
                        Home.show();
                    } else {
                        console.warn('⚠️ Home.show no está definido');
                        // Fallback: mostrar pantalla de inicio manualmente
                        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                        const homeScreen = document.getElementById('screen-home');
                        if (homeScreen) homeScreen.classList.add('active');
                        const fab = document.getElementById('fabScan');
                        if (fab) fab.classList.add('show');
                    }
                },
                'promociones': () => {
                    if (typeof PromocionesNETO !== 'undefined' && PromocionesNETO.show) {
                        PromocionesNETO.show();
                    } else if (typeof Promociones !== 'undefined' && Promociones.show) {
                        Promociones.show();
                    } else {
                        console.warn('⚠️ Promociones no está definido');
                        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                        const screen = document.getElementById('screen-promociones');
                        if (screen) screen.classList.add('active');
                        const fab = document.getElementById('fabScan');
                        if (fab) fab.classList.add('show');
                    }
                },
                'caducidades': () => {
                    if (typeof Caducidades !== 'undefined' && Caducidades.show) {
                        Caducidades.show();
                    } else {
                        console.warn('⚠️ Caducidades no está definido');
                        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                        const screen = document.getElementById('screen-caducidades');
                        if (screen) screen.classList.add('active');
                        const fab = document.getElementById('fabScan');
                        if (fab) fab.classList.add('show');
                    }
                },
                'ciclicos': () => {
                    if (typeof Ciclicos !== 'undefined' && Ciclicos.show) {
                        Ciclicos.show();
                    } else {
                        console.warn('⚠️ Ciclicos no está definido');
                        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                        const screen = document.getElementById('screen-ciclicos');
                        if (screen) screen.classList.add('active');
                        const fab = document.getElementById('fabScan');
                        if (fab) fab.classList.add('show');
                    }
                },
                'inventario': () => {
                    if (typeof Inventario !== 'undefined' && Inventario.show) {
                        Inventario.show();
                    } else {
                        console.warn('⚠️ Inventario no está definido');
                        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                        const screen = document.getElementById('screen-inventario');
                        if (screen) screen.classList.add('active');
                        const fab = document.getElementById('fabScan');
                        if (fab) fab.classList.add('show');
                    }
                },
                'visual': () => {
                    if (typeof Visual !== 'undefined' && Visual.show) {
                        Visual.show();
                    } else {
                        console.warn('⚠️ Visual no está definido');
                        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                        const screen = document.getElementById('screen-visual');
                        if (screen) screen.classList.add('active');
                        const fab = document.getElementById('fabScan');
                        if (fab) fab.classList.remove('show');
                    }
                }
            };
            
            if (screens[screenId]) {
                screens[screenId]();
            } else {
                console.error('❌ Pantalla no encontrada:', screenId);
            }
        };
    },

    /**
     * Configura el escáner
     */
    setupScanner() {
        window.activarEscaneo = () => {
            if (typeof Scanner !== 'undefined' && Scanner.activate) {
                Scanner.activate();
            } else {
                console.warn('⚠️ Scanner no está definido');
                alert('📷 Escáner: Ingresa el código manualmente');
                // Enfocar el input activo
                const inputs = document.querySelectorAll('.barcode-input');
                for (let input of inputs) {
                    if (input.offsetParent !== null) {
                        input.focus();
                        input.select();
                        break;
                    }
                }
            }
        };
        
        window.enfocarInput = (id) => {
            const input = document.getElementById(id);
            if (input) {
                input.focus();
                input.select();
            }
        };
        
        // Listener para cuando se completa un escaneo
        if (typeof Scanner !== 'undefined' && Scanner.addListener) {
            Scanner.addListener((event, data) => {
                if (event === 'scanComplete' && data.target) {
                    const target = data.target;
                    if (target.id === 'ciclico-codigo' && target.value.trim()) {
                        setTimeout(() => {
                            if (typeof Ciclicos !== 'undefined' && Ciclicos.buscar) {
                                Ciclicos.buscar();
                            }
                        }, 300);
                    }
                }
            });
        }
    },

    /**
     * Configura atajos para campos de código de barras
     */
    setupBarcodeShortcuts() {
        document.querySelectorAll('.barcode-input').forEach(input => {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && this.value.trim()) {
                    this.dispatchEvent(new Event('change'));
                }
            });
        });
    },

    /**
     * Carga datos iniciales
     */
    cargarDatosIniciales() {
        // Cargar promociones si existe la función
        if (typeof PromocionesNETO !== 'undefined' && PromocionesNETO.cargarPromocionesGuardadas) {
            PromocionesNETO.cargarPromocionesGuardadas();
        } else if (typeof Promociones !== 'undefined' && Promociones.cargar) {
            Promociones.cargar();
        }
        
        // Cargar caducidades
        if (typeof Caducidades !== 'undefined' && Caducidades.cargar) {
            Caducidades.cargar();
        }
        
        // Actualizar visualización
        if (typeof Visual !== 'undefined' && Visual.actualizar) {
            Visual.actualizar();
        }
        
        // Actualizar badges
        if (typeof Home !== 'undefined' && Home.updateBadges) {
            Home.updateBadges();
        }
    },

    /**
     * Exporta todos los datos
     */
    exportar() {
        if (typeof Storage !== 'undefined' && Storage.exportAll) {
            const datos = Storage.exportAll();
            const blob = new Blob([JSON.stringify(datos, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'inventario_barras_' + new Date().toISOString().slice(0,10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert('⚠️ Error: Storage no está disponible');
        }
    },

    /**
     * Importa datos desde un archivo
     */
    importar() {
        if (typeof Storage === 'undefined') {
            alert('⚠️ Error: Storage no está disponible');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const datos = JSON.parse(ev.target.result);
                    if (typeof Storage.importAll === 'function') {
                        Storage.importAll(datos);
                        alert('✅ Datos importados exitosamente');
                        location.reload();
                    } else {
                        alert('⚠️ Error: Storage.importAll no está disponible');
                    }
                } catch (err) {
                    alert('⚠️ Error al importar: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    /**
     * Limpia todos los datos
     */
    limpiar() {
        if (!confirm('⚠️ ¿Estás seguro de eliminar TODOS los datos?\nEsta acción no se puede deshacer.')) return;
        if (!confirm('Confirmación final: ¿Eliminar todos los datos?')) return;
        
        if (typeof Storage !== 'undefined' && Storage.clearAll) {
            Storage.clearAll();
            alert('🗑️ Todos los datos han sido eliminados');
            location.reload();
        } else {
            // Fallback: limpiar manualmente
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('inv_barras_')) {
                    localStorage.removeItem(key);
                }
            });
            alert('🗑️ Todos los datos han sido eliminados');
            location.reload();
        }
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Pequeño retraso para asegurar que todos los scripts se cargaron
        setTimeout(function() {
            App.init();
        }, 100);
    });
} else {
    setTimeout(function() {
        App.init();
    }, 100);
}

// Exportar funciones globales para usar desde HTML
window.exportarDatos = function() {
    if (typeof App !== 'undefined' && App.exportar) {
        App.exportar();
    } else {
        console.warn('⚠️ App no está disponible');
    }
};

window.importarDatos = function() {
    if (typeof App !== 'undefined' && App.importar) {
        App.importar();
    } else {
        console.warn('⚠️ App no está disponible');
    }
};

window.limpiarTodosLosDatos = function() {
    if (typeof App !== 'undefined' && App.limpiar) {
        App.limpiar();
    } else {
        console.warn('⚠️ App no está disponible');
    }
};

console.log('✅ app.js cargado correctamente');