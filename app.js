/**
 * ========================================
 * SEGUIMIENTO DE RUTINAS - APP PRINCIPAL
 * ========================================
 * Una aplicación para cultivar hábitos usando la metáfora de árboles
 * Cada rutina es una planta que crece con cada clic (máximo 5 niveles)
 */

// ========================================
// CONFIGURACIÓN Y CONSTANTES
// ========================================

const CONFIG = {
    MAX_LEVEL: 5,
    STORAGE_KEY: 'routine_tracker_data',
    TREE_EMOJIS: ['🪴', '🌱', '🌿', '🪻', '🌺', '🌳'],
    LEVEL_MESSAGES: [
        '¡Semilla plantada! 🌱',
        '¡Brotes apareciendo! 🌿',
        '¡Creciendo fuerte! 💪',
        '¡Ya tiene flores! 🌸',
        '¡Casi un árbol! 🌳',
        '¡ÁRBOL COMPLETO! 🎉'
    ],
    SPARKLE_EMOJIS: ['✨', '⭐', '🌟', '💫', '🌿', '🌸', '🍃']
};

// ========================================
// ESTADO DE LA APLICACIÓN
// ========================================

let routines = [];
let routineToDelete = null;

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const elements = {
    routineForm: document.getElementById('routineForm'),
    routineName: document.getElementById('routineName'),
    routineColor: document.getElementById('routineColor'),
    routinesGrid: document.getElementById('routinesGrid'),
    emptyState: document.getElementById('emptyState'),
    totalRoutines: document.getElementById('totalRoutines'),
    completedTrees: document.getElementById('completedTrees'),
    totalClicks: document.getElementById('totalClicks'),
    deleteModal: document.getElementById('deleteModal'),
    cancelDelete: document.getElementById('cancelDelete'),
    confirmDelete: document.getElementById('confirmDelete'),
    toast: document.getElementById('toast')
};

// ========================================
// FUNCIONES DE ALMACENAMIENTO
// ========================================

/**
 * Guarda las rutinas en localStorage
 */
function saveRoutines() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(routines));
    } catch (error) {
        console.error('Error al guardar rutinas:', error);
        showToast('Error al guardar datos', 'error');
    }
}

/**
 * Carga las rutinas desde localStorage
 */
function loadRoutines() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (data) {
            routines = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error al cargar rutinas:', error);
        routines = [];
    }
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Genera un ID único para cada rutina
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Muestra un mensaje toast
 */
function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

/**
 * Obtiene el emoji del árbol según el nivel
 */
function getTreeEmoji(level) {
    return CONFIG.TREE_EMOJIS[Math.min(level, CONFIG.MAX_LEVEL)];
}

/**
 * Obtiene el mensaje del nivel
 */
function getLevelMessage(level) {
    return CONFIG.LEVEL_MESSAGES[Math.min(level, CONFIG.MAX_LEVEL)];
}

// ========================================
// FUNCIONES DE RUTINAS
// ========================================

/**
 * Agrega una nueva rutina
 */
function addRoutine(name, color) {
    const routine = {
        id: generateId(),
        name: name.trim(),
        color: color,
        level: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        lastClicked: null,
        completed: false
    };
    
    routines.push(routine);
    saveRoutines();
    renderRoutines();
    updateStats();
    
    showToast(`¡"${name}" plantada! 🌱`, 'success');
}

/**
 * Incrementa el nivel de una rutina
 */
function incrementLevel(routineId) {
    const routine = routines.find(r => r.id === routineId);
    
    if (!routine) return;
    
    // Si ya está completa, no hacer nada
    if (routine.completed) {
        showToast('¡Este árbol ya está completo! 🌳', 'info');
        return;
    }
    
    // Incrementar nivel
    routine.level = Math.min(routine.level + 1, CONFIG.MAX_LEVEL);
    routine.clicks++;
    routine.lastClicked = new Date().toISOString();
    
    // Verificar si completó el árbol
    if (routine.level >= CONFIG.MAX_LEVEL) {
        routine.completed = true;
        showToast(`¡Felicidades! "${routine.name}" es un árbol completo! 🎉`, 'success');
    } else {
        showToast(`${routine.name}: Nivel ${routine.level} ${getTreeEmoji(routine.level)}`, 'success');
    }
    
    saveRoutines();
    renderRoutines();
    updateStats();
    
    // Crear efecto de partículas
    createSparkles(routineId);
}

/**
 * Elimina una rutina
 */
function deleteRoutine(routineId) {
    const index = routines.findIndex(r => r.id === routineId);
    
    if (index === -1) return;
    
    const routineName = routines[index].name;
    routines.splice(index, 1);
    
    saveRoutines();
    renderRoutines();
    updateStats();
    
    showToast(`"${routineName}" eliminada`, 'info');
}

// ========================================
// FUNCIONES DE RENDERIZADO
// ========================================

/**
 * Renderiza todas las rutinas
 */
function renderRoutines() {
    // Limpiar grid
    elements.routinesGrid.innerHTML = '';
    
    // Mostrar/ocultar estado vacío
    if (routines.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.routinesGrid.classList.add('hidden');
        return;
    }
    
    elements.emptyState.classList.add('hidden');
    elements.routinesGrid.classList.remove('hidden');
    
    // Renderizar cada rutina
    routines.forEach(routine => {
        const card = createRoutineCard(routine);
        elements.routinesGrid.appendChild(card);
    });
}

/**
 * Crea la tarjeta de una rutina
 */
function createRoutineCard(routine) {
    const card = document.createElement('div');
    card.className = `routine-card ${routine.completed ? 'completed' : ''}`;
    card.dataset.color = routine.color;
    card.dataset.id = routine.id;
    
    const treeEmoji = getTreeEmoji(routine.level);
    const levelMessage = getLevelMessage(routine.level);
    
    card.innerHTML = `
        <button class="delete-btn" data-id="${routine.id}" title="Eliminar rutina">
            ✕
        </button>
        
        <div class="routine-name" title="${routine.name}">
            ${routine.name}
        </div>
        
        <div class="plant-container" data-id="${routine.id}">
            <div class="tree ${routine.completed ? 'completed' : ''}" data-id="${routine.id}">
                ${treeEmoji}
            </div>
            <div class="pot">
                <div class="pot-soil"></div>
                <div class="pot-rim"></div>
                <div class="pot-body"></div>
            </div>
        </div>
        
        <div class="progress-indicator">
            ${Array.from({length: CONFIG.MAX_LEVEL}, (_, i) => `
                <div class="progress-dot ${i < routine.level ? 'active completed' : ''} ${i === routine.level - 1 ? 'active' : ''}"></div>
            `).join('')}
        </div>
        
        <div class="level-message ${routine.completed ? 'completed' : ''}">
            ${levelMessage}
        </div>
    `;
    
    // Event listeners
    const plantContainer = card.querySelector('.plant-container');
    plantContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        incrementLevel(routine.id);
        
        // Animación de crecimiento
        const tree = card.querySelector('.tree');
        tree.classList.remove('growing');
        void tree.offsetWidth; // Forzar reflow
        tree.classList.add('growing');
    });
    
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteModal(routine.id);
    });
    
    return card;
}

/**
 * Actualiza las estadísticas
 */
function updateStats() {
    const total = routines.length;
    const completed = routines.filter(r => r.completed).length;
    const clicks = routines.reduce((sum, r) => sum + r.clicks, 0);
    
    animateNumber(elements.totalRoutines, total);
    animateNumber(elements.completedTrees, completed);
    animateNumber(elements.totalClicks, clicks);
}

/**
 * Anima un número
 */
function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const diff = target - current;
    const duration = 500;
    const steps = 20;
    const stepValue = diff / steps;
    const stepTime = duration / steps;
    
    let step = 0;
    const interval = setInterval(() => {
        step++;
        const value = Math.round(current + (stepValue * step));
        element.textContent = value;
        
        if (step >= steps) {
            element.textContent = target;
            clearInterval(interval);
        }
    }, stepTime);
}

// ========================================
// EFECTOS VISUALES
// ========================================

/**
 * Crea partículas de brillo al hacer clic
 */
function createSparkles(routineId) {
    const card = document.querySelector(`[data-id="${routineId}"]`);
    if (!card) return;
    
    const container = card.querySelector('.plant-container');
    if (!container) return;
    
    // Crear 5 partículas aleatorias
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = CONFIG.SPARKLE_EMOJIS[Math.floor(Math.random() * CONFIG.SPARKLE_EMOJIS.length)];
            
            // Posición aleatoria dentro del contenedor
            sparkle.style.left = `${Math.random() * 80 + 10}%`;
            sparkle.style.top = `${Math.random() * 60 + 20}%`;
            
            container.appendChild(sparkle);
            
            // Eliminar después de la animación
            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 100);
    }
}

// ========================================
// MODAL DE ELIMINACIÓN
// ========================================

/**
 * Muestra el modal de confirmación de eliminación
 */
function showDeleteModal(routineId) {
    routineToDelete = routineId;
    elements.deleteModal.classList.add('active');
}

/**
 * Oculta el modal de eliminación
 */
function hideDeleteModal() {
    routineToDelete = null;
    elements.deleteModal.classList.remove('active');
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Inicializa todos los event listeners
 */
function initEventListeners() {
    // Formulario de nueva rutina
    elements.routineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = elements.routineName.value;
        const color = elements.routineColor.value;
        
        if (name.trim()) {
            addRoutine(name, color);
            elements.routineName.value = '';
            elements.routineName.focus();
        }
    });
    
    // Modal de eliminación
    elements.cancelDelete.addEventListener('click', hideDeleteModal);
    
    elements.confirmDelete.addEventListener('click', () => {
        if (routineToDelete) {
            deleteRoutine(routineToDelete);
            hideDeleteModal();
        }
    });
    
    // Cerrar modal al hacer clic fuera
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) {
            hideDeleteModal();
        }
    });
    
    // Tecla Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.deleteModal.classList.contains('active')) {
            hideDeleteModal();
        }
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================

/**
 * Inicializa la aplicación
 */
function init() {
    console.log('🌱 Inicializando Seguimiento de Rutinas...');
    
    // Cargar datos guardados
    loadRoutines();
    
    // Renderizar rutinas existentes
    renderRoutines();
    
    // Actualizar estadísticas
    updateStats();
    
    // Inicializar event listeners
    initEventListeners();
    
    console.log(`✅ App inicializada con ${routines.length} rutinas`);
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
