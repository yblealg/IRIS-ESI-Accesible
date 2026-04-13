/* ============================================================
   CONFIGURACIÓN DE NAVEGACIÓN Y MOTORES - PROYECTO IRIS
   ============================================================ */
let nombreUsuario = "";
const sintetizador = window.speechSynthesis;
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
const oido = new Reconocimiento();
const robot = document.getElementById('robot-avatar');

oido.lang = 'es-CO';
oido.continuous = false;
oido.interimResults = false;

// FUNCIÓN PARA SELECCIONAR VOZ FEMENINA LATINA (CARGA ASÍNCRONA)
let vozFemenina = null;
function cargarVoces() {
    const voces = sintetizador.getVoices();
    // Prioridad: Voces de Google o locales que suenen naturales y femeninas
    vozFemenina = voces.find(v => (v.lang.includes('es-CO') || v.lang.includes('es-MX')) && 
                                 (v.name.includes('Helena') || v.name.includes('Sabina') || v.name.includes('Google'))) 
                  || voces.find(v => v.lang.includes('es'));
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = cargarVoces;
}
cargarVoces();

// FUNCIÓN PARA GESTIONAR ESTADOS VISUALES DEL ROBOT (Tus clases del CSS)
function setRobotEstado(estado) {
    if (!robot) return;
    // Limpiamos todas las posibles clases de estado antes de poner la nueva
    robot.classList.remove('robot-reposo', 'robot-hablando', 'robot-escuchando', 'robot-error');
    
    switch(estado) {
        case 'hablando': robot.classList.add('robot-hablando'); break;
        case 'escuchando': robot.classList.add('robot-escuchando'); break;
        case 'error': robot.classList.add('robot-error'); break;
        default: robot.classList.add('robot-reposo');
    }
}

// FUNCIÓN DE VOZ DE IRIS (CON PARCHE PARA MÓVILES)
function hablar(mensaje) {
    sintetizador.cancel(); // Detener cualquier habla previa
    const lectura = new SpeechSynthesisUtterance(mensaje);
    
    if (!vozFemenina) cargarVoces(); 
    lectura.voice = vozFemenina;
    lectura.lang = 'es-CO';
    lectura.rate = 1.0; 
    lectura.pitch = 1.1; 

    const cuadro = document.getElementById('cuadro-texto');
    const display = document.getElementById('texto-dinamico');

    if (display) display.innerText = mensaje;
    if (cuadro) cuadro.style.borderColor = "#00FF00"; 
    
    setRobotEstado('hablando');

    lectura.onend = () => {
        setRobotEstado('reposo');
        // Pequeño delay para que el usuario procese antes de abrir micro
        setTimeout(() => iniciarEscucha(), 600);
    };

    sintetizador.speak(lectura);
}

// FUNCIÓN DE ESCUCHA (CON CONTROL DE ERRORES)
function iniciarEscucha() {
    try {
        oido.start();
        const display = document.getElementById('texto-dinamico');
        const cuadro = document.getElementById('cuadro-texto');
        
        if (display) display.innerText = ">>> IRIS ESCUCHANDO... (Habla ahora)";
        if (cuadro) cuadro.style.borderColor = "yellow"; 
        
        setRobotEstado('escuchando');
    } catch (e) { 
        console.log("El reconocimiento ya estaba activo o hubo un error."); 
    }
}

// REACCIÓN AL HABLAR (TU LÓGICA DE NOMBRE)
oido.onresult = (event) => {
    const voz = event.results[0][0].transcript.toLowerCase();
    
    if (!nombreUsuario) {
        // Limpieza básica de la entrada del nombre
        nombreUsuario = voz.replace("mi nombre es", "").replace("soy", "").trim();
        hablar(`Mucho gusto, ${nombreUsuario}. Tienes derecho a decidir sobre tu vida. Para explorar los temas por favor pronuncia algunas de estas palabras: CUERPO, MITOS o DECISIÓN.`);
    } else {
        procesarComandos(voz);
    }
};

// MANEJO DE ERRORES/SILENCIOS
oido.onend = () => {
    const display = document.getElementById('texto-dinamico');
    const cuadro = document.getElementById('cuadro-texto');

    // Si el texto sigue diciendo "ESCUCHANDO" es porque no captó nada
    if (display && display.innerText.includes("ESCUCHANDO")) {
        const msg = "No logré escucharte. Toca la pantalla, haz click o el toca el botón activar para intentar de nuevo.";
        display.innerText = msg;
        if (cuadro) cuadro.style.borderColor = "red"; 
        
        setRobotEstado('error');
        setTimeout(() => setRobotEstado('reposo'), 1000);

        const aviso = new SpeechSynthesisUtterance("No te escuché. Toca la pantalla para reintentar.");
        aviso.voice = vozFemenina;
        sintetizador.speak(aviso);
    }
};

// NAVEGACIÓN PEDAGÓGICA (TUS TEMAS COMPLETOS)
function procesarComandos(comando) {
    if (comando.includes("cuerpo")) {
        hablar(`${nombreUsuario}, la dimensión biológica trata sobre tu salud y autonomía física. No se trata solo de la ausencia de enfermedad, ` +
               `sino del conocimiento de tu anatomía, tus sentidos y tus funciones reproductivas. Implica el derecho a recibir servicios de salud ` +
               `adaptados a tus necesidades, el acceso a información clara sobre higiene, prevención y la libertad de disfrutar de tu bienestar físico ` +
               `sin que la discapacidad sea vista como una limitación de tu integridad. ¿Quieres ver MITOS o DECISIÓN?`);
    } 
    else if (comando.includes("mitos")) {
        hablar(`Escucha bien, ${nombreUsuario}. La dimensión social rompe barreras. No hay límites para el deseo en la discapacidad. ` +
               `Reconoce que las personas con discapacidad son seres sexuales con derecho a amar, ser amados y expresar su erotismo sin juicios. ` +
               `Esta dimensión denuncia las barreras del entorno y los prejuicios de la sociedad que intentan infantilizar o invisibilizar tu sexualidad. ` +
               `Se trata de tu derecho a participar en la vida social, a formar una familia si lo deseas y a que tu intimidad sea respetada como la de cualquier otro ciudadano. ` +
               `¿Quieres ir a CUERPO o DECISIÓN?`);
    } 
    else if (comando.includes("decisión") || comando.includes("ética") || comando.includes("decision")) {
        hablar(`${nombreUsuario}, la dimensión ética es tu poder de decidir. Se fundamenta en la autonomía y en la capacidad de elegir tus propios valores y estilo de vida. ` +
               `Implica el juicio crítico para distinguir entre lo que deseas y lo que otros te imponen, asegurando que el consentimiento sea siempre el pilar de tus relaciones. ` +
               `Es tu derecho a decir no, a decir sí, y a ser responsable de tus decisiones afectivas en un marco de respeto y libertad personal. ` +
               `¿Quieres volver a explorar? Di: CUERPO, MITOS o INICIO.`);
    } 
    else if (comando.includes("inicio")) {
        hablar(`Hola de nuevo ${nombreUsuario}. Elige una dimensión para profundizar: CUERPO, MITOS o DECISIÓN.`);
    } 
    else {
        hablar(`No logré entenderte ${nombreUsuario}. Intenta decir una de las opciones: Cuerpo, Mitos o Decisión.`);
    }
}

// ACTIVACIÓN DEL SISTEMA (Función vinculada al botón)
function iniciarSistema() {
    // IMPORTANTE: Desbloquea el motor de audio en navegadores móviles
    if (sintetizador.paused) {
        sintetizador.resume();
    }
    
    nombreUsuario = ""; 
    setRobotEstado('reposo');
    hablar("Bienvenido a este espacio seguro, soy IRIS. Mi misión es brindarte herramientas claras sobre educación sexual integral, sin barreras y con total respeto por tu diversidad. Aquí, la información es libertad y el consentimiento es nuestra base. ¿Con quién tengo el gusto de hablar?");
}

/* ============================================================
   ACCESIBILIDAD GLOBAL Y FIXES MÓVILES
   ============================================================ */

// Evento para el botón en pantallas táctiles (Evita el lag de 300ms)
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-iniciar");
    if (btn) {
        btn.addEventListener("touchstart", (e) => {
            e.preventDefault(); // Evita que el navegador lance el click normal después
            iniciarSistema();
        }, { passive: false });
    }
});

// Teclado y Click General
window.addEventListener('keydown', (e) => {
    const display = document.getElementById('texto-dinamico');
    if (display && (display.innerText.includes("Presiona") || display.innerText.includes("No logré"))) {
        iniciarSistema();
    }
});

window.addEventListener('click', (e) => {
    const display = document.getElementById('texto-dinamico');
    // Si no es el botón (porque él ya tiene su onclick) y estamos en pantalla de inicio o error
    if (e.target.id !== "btn-iniciar" && display && 
       (display.innerText.includes("Presiona") || display.innerText.includes("No logré"))) {
        iniciarSistema();
    }
});