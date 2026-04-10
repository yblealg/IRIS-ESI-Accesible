// CONFIGURACIÓN DE NAVEGACIÓN Y MOTORES
let nombreUsuario = "";
const sintetizador = window.speechSynthesis;
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
const oido = new Reconocimiento();

oido.lang = 'es-CO';
oido.continuous = false;
oido.interimResults = false;

// FUNCIÓN PARA SELECCIONAR VOZ FEMENINA LATINA
function obtenerVozFemenina() {
    const voces = sintetizador.getVoices();
    // Prioridad: Voces de Colombia, México o generales de Google/Microsoft
    return voces.find(v => (v.lang.includes('es-CO') || v.lang.includes('es-MX') || v.lang.includes('es-ES')) && 
                    (v.name.includes('Helena') || v.name.includes('Sabina') || v.name.includes('Dalia') || v.name.includes('Google'))) 
           || voces.find(v => v.lang.includes('es'));
}

// FUNCIÓN DE VOZ DE IRIS
function hablar(mensaje) {
    sintetizador.cancel();
    const lectura = new SpeechSynthesisUtterance(mensaje);
    
    lectura.voice = obtenerVozFemenina();
    lectura.lang = 'es-CO';
    lectura.rate = 1.0; 
    lectura.pitch = 1.1; // Tono ligeramente más agudo/femenino

    document.getElementById('texto-dinamico').innerText = mensaje;
    document.getElementById('cuadro-texto').style.borderColor = "#00FF00"; // Verde al hablar

    lectura.onend = () => {
        setTimeout(() => iniciarEscucha(), 600);
    };

    sintetizador.speak(lectura);
}

// FUNCIÓN DE ESCUCHA
function iniciarEscucha() {
    try {
        oido.start();
        document.getElementById('texto-dinamico').innerText = ">>> IRIS ESCUCHANDO... (Habla ahora)";
        document.getElementById('cuadro-texto').style.borderColor = "yellow"; // Amarillo al oír
    } catch (e) { console.log("Micrófono activo"); }
}

// REACCIÓN AL HABLAR
oido.onresult = (event) => {
    const voz = event.results[0][0].transcript.toLowerCase();
    
    if (!nombreUsuario) {
        nombreUsuario = voz;
        hablar(`Mucho gusto, ${nombreUsuario}. Tienes derecho a decidir sobre tu vida. Di: CUERPO, MITOS o DECISIÓN.`);
    } else {
        procesarComandos(voz);
    }
};

// MANEJO DE ERRORES/SILENCIOS
oido.onend = () => {
    if (document.getElementById('texto-dinamico').innerText.includes("ESCUCHANDO")) {
        const msg = "No logré escucharte. Toca cualquier parte de la pantalla o presiona una tecla para intentar de nuevo.";
        document.getElementById('texto-dinamico').innerText = msg;
        document.getElementById('cuadro-texto').style.borderColor = "red"; // Rojo en error
        
        const aviso = new SpeechSynthesisUtterance("No te escuché. Toca la pantalla para reintentar.");
        aviso.voice = obtenerVozFemenina();
        sintetizador.speak(aviso);
    }
};

// NAVEGACIÓN PEDAGÓGICA
function procesarComandos(comando) {
    if (comando.includes("cuerpo")) {
        hablar(`${nombreUsuario}, la dimensión biológica trata sobre tu salud y autonomía física. ¿Quieres ver MITOS o DECISIÓN?`);
    } else if (comando.includes("mitos")) {
        hablar("La dimensión social rompe barreras. No hay límites para el deseo en la discapacidad. ¿Quieres ir a CUERPO o DECISIÓN?");
    } else if (comando.includes("decisión")) {
        hablar(`${nombreUsuario}, la dimensión ética es tu poder de decidir. El consentimiento es tuyo. Di INICIO para volver.`);
    } else if (comando.includes("inicio")) {
        hablar(`Hola de nuevo ${nombreUsuario}. Elige: CUERPO, MITOS o DECISIÓN.`);
    } else {
        hablar("No entendí. Intenta decir: Cuerpo, Mitos o Decisión.");
    }
}

// ACTIVACIÓN DEL SISTEMA
function iniciarSistema() {
    nombreUsuario = ""; 
    hablar("Hola, soy I.R.I.S. Tu guía de educación sexual. ¿Cuál es tu nombre?");
}

// ACCESIBILIDAD GLOBAL (CLIC O TECLA)
window.addEventListener('keydown', () => {
    if (document.getElementById('cuadro-texto').style.borderColor === "red") iniciarSistema();
});

window.addEventListener('click', (e) => {
    if (e.target.id !== "btn-iniciar" && document.getElementById('cuadro-texto').style.borderColor === "red") {
        iniciarSistema();
    }
});

// Carga de voces para navegadores lentos
speechSynthesis.onvoiceschanged = () => obtenerVozFemenina();