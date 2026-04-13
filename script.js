/* ============================================================
   CONFIGURACIÓN DE NAVEGACIÓN Y MOTORES - PROYECTO IRIS
   ESTRATEGIA PEDAGÓGICA - UNAD TAREA 3
   ============================================================ */

let nombreUsuario = "";
let temasPendientes = ["CUERPO", "MITOS", "DECISIÓN"];
const sintetizador = window.speechSynthesis;
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
const oido = new Reconocimiento();
const robot = document.getElementById('robot-avatar');

// Configuración del Reconocimiento de Voz
oido.lang = 'es-CO';
oido.continuous = false;
oido.interimResults = false;

/* --- GESTIÓN DE VOCES --- */
let vozFemenina = null;

function cargarVoces() {
    const voces = sintetizador.getVoices();
    vozFemenina = voces.find(v => (v.lang.includes('es-CO') || v.lang.includes('es-MX')) && 
                                 (v.name.includes('Helena') || v.name.includes('Sabina') || v.name.includes('Google'))) 
                  || voces.find(v => v.lang.includes('es'));
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = cargarVoces;
}
cargarVoces();

/* --- ESTADOS VISUALES DEL AVATAR --- */
function setRobotEstado(estado) {
    if (!robot) return;
    robot.classList.remove('robot-reposo', 'robot-hablando', 'robot-escuchando', 'robot-error');
    
    switch(estado) {
        case 'hablando': robot.classList.add('robot-hablando'); break;
        case 'escuchando': robot.classList.add('robot-escuchando'); break;
        case 'error': robot.classList.add('robot-error'); break;
        default: robot.classList.add('robot-reposo');
    }
}

/* --- FUNCIÓN PRINCIPAL DE HABLA (MOTOR DE IRIS) --- */
function hablar(mensaje) {
    sintetizador.cancel(); 
    const lectura = new SpeechSynthesisUtterance(mensaje);
    
    if (!vozFemenina) cargarVoces(); 
    lectura.voice = vozFemenina;
    lectura.lang = 'es-CO';
    lectura.rate = 1.0; 
    lectura.pitch = 1.1; 

    const display = document.getElementById('texto-dinamico');
    const cuadro = document.getElementById('cuadro-texto');
    const contenedorCreditos = document.getElementById('efecto-creditos');

    if (display) display.innerText = mensaje;
    if (cuadro) cuadro.style.borderColor = "#00FF00"; 
    
    if (contenedorCreditos) {
        contenedorCreditos.style.animation = 'none';
        contenedorCreditos.offsetHeight; 
        let velocidad = mensaje.length > 200 ? '28s' : '18s';
        contenedorCreditos.style.animation = `subirCreditos ${velocidad} linear infinite`;
    }

    setRobotEstado('hablando');

    lectura.onend = () => {
        setRobotEstado('reposo');
        // Solo vuelve a escuchar si no hemos finalizado la sesión
        if (!mensaje.includes("sesión finalizada")) {
            setTimeout(() => iniciarEscucha(), 700);
        }
    };

    sintetizador.speak(lectura);
}

/* --- MOTOR DE ESCUCHA --- */
function iniciarEscucha() {
    try {
        oido.start();
        const display = document.getElementById('texto-dinamico');
        const cuadro = document.getElementById('cuadro-texto');
        
        if (display) display.innerText = ">>> IRIS ESCUCHANDO... (Habla ahora)";
        if (cuadro) cuadro.style.borderColor = "yellow"; 
        
        setRobotEstado('escuchando');
    } catch (e) { 
        console.warn("Micrófono activo."); 
    }
}

/* --- LÓGICA DE RESPUESTA --- */
oido.onresult = (event) => {
    const voz = event.results[0][0].transcript.toLowerCase();
    
    if (!nombreUsuario) {
        nombreUsuario = voz.replace("mi nombre es", "").replace("soy", "").trim();
        hablar(`Mucho gusto, ${nombreUsuario}. Tienes derecho a decidir sobre tu vida. Para explorar los temas por favor pronuncia: CUERPO, MITOS o DECISIÓN.`);
    } else {
        procesarComandos(voz);
    }
};

/* --- MANEJO DE ERRORES --- */
oido.onend = () => {
    const display = document.getElementById('texto-dinamico');
    if (display && display.innerText.includes("ESCUCHANDO")) {
        setRobotEstado('error');
        setTimeout(() => setRobotEstado('reposo'), 1200);
        hablar("No logré escucharte. Toca la pantalla o el botón para intentar de nuevo.");
    }
};

/* --- NAVEGACIÓN PEDAGÓGICA (FILTRADA Y CON CIERRE) --- */
function procesarComandos(comando) {
    let respuesta = "";

    // Opción para salir o finalizar
    if (comando.includes("salir") || comando.includes("finalizar") || comando.includes("terminar")) {
        hablar(`Gracias por participar, ${nombreUsuario}. Tu voz y tu autonomía son lo más importante. Hasta pronto, sesión finalizada.`);
        return;
    }

    // Opción para reiniciar el contenido
    if (comando.includes("inicio") || comando.includes("repetir") || comando.includes("reiniciar")) {
        temasPendientes = ["CUERPO", "MITOS", "DECISIÓN"];
        hablar(`Muy bien ${nombreUsuario}, reiniciamos el recorrido. Elige una dimensión: CUERPO, MITOS o DECISIÓN.`);
        return;
    }

    // Filtrado de temas
    if (comando.includes("cuerpo") && temasPendientes.includes("CUERPO")) {
        temasPendientes = temasPendientes.filter(t => t !== "CUERPO");
        respuesta = `${nombreUsuario}, la dimensión biológica trata sobre tu salud y autonomía física. Implica el conocimiento de tu anatomía y el acceso a servicios de salud sin que la discapacidad limite tu integridad. `;
    } 
    else if (comando.includes("mitos") && temasPendientes.includes("MITOS")) {
        temasPendientes = temasPendientes.filter(t => t !== "MITOS");
        respuesta = `Escucha bien, ${nombreUsuario}. La dimensión social rompe barreras. Las personas con discapacidad tienen derecho a amar y expresar su erotismo sin prejuicios de la sociedad. `;
    } 
    else if ((comando.includes("decisión") || comando.includes("ética") || comando.includes("decision")) && temasPendientes.includes("DECISIÓN")) {
        temasPendientes = temasPendientes.filter(t => t !== "DECISIÓN");
        respuesta = `${nombreUsuario}, la dimensión ética es tu poder de elegir. Implica el juicio crítico para decidir sobre tus relaciones basándote siempre en el consentimiento. `;
    } 
    else {
        if (temasPendientes.length > 0) {
            hablar(`Ese tema ya lo vimos o no es válido, ${nombreUsuario}. Por favor elige: ${temasPendientes.join(", ")}.`);
        } else {
            hablar(`Ya exploramos todo, ${nombreUsuario}. ¿Deseas REPETIR el contenido o prefieres SALIR?`);
        }
        return;
    }

    // Lógica de continuación o finalización
    if (temasPendientes.length > 0) {
        respuesta += `¡Muy bien! Ahora solo nos falta explorar: ${temasPendientes.join(" o ")}. ¿Cuál eliges?`;
    } else {
        respuesta += `¡Felicidades ${nombreUsuario}! Has completado todas las dimensiones. Ahora tienes más herramientas para tu autonomía. ¿Quieres REPETIR el inicio o prefieres SALIR?`;
    }

    hablar(respuesta);
}

/* --- FUNCIÓN DE ARRANQUE --- */
function iniciar() {
    if (sintetizador.paused) sintetizador.resume();
    nombreUsuario = ""; 
    temasPendientes = ["CUERPO", "MITOS", "DECISIÓN"];
    setRobotEstado('reposo');
    hablar("Bienvenido a este espacio seguro, soy IRIS. Mi misión es brindarte herramientas sobre educación sexual integral y autonomía. ¿Con quién tengo el gusto de hablar?");
}

/* --- EVENTOS --- */
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-iniciar");
    if (btn) {
        btn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            iniciar();
        }, { passive: false });
    }
});

window.addEventListener('click', (e) => {
    const display = document.getElementById('texto-dinamico');
    if (e.target.id !== "btn-iniciar" && display && 
       (display.innerText.includes("Presiona") || display.innerText.includes("No logré") || display.innerText.includes("finalizada"))) {
        iniciar();
    }
});