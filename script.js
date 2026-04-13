/* ============================================================
   CONFIGURACIÓN DE NAVEGACIÓN Y MOTORES - PROYECTO IRIS
   ESTRATEGIA PEDAGÓGICA - UNAD TAREA 3
   ============================================================ */

let nombreUsuario = "";
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
    // Buscamos una voz que suene natural en español
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
        case 'hablando': 
            robot.classList.add('robot-hablando'); 
            break;
        case 'escuchando': 
            robot.classList.add('robot-escuchando'); 
            break;
        case 'error': 
            robot.classList.add('robot-error'); 
            break;
        default: 
            robot.classList.add('robot-reposo');
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

    // Actualizar texto en pantalla
    if (display) display.innerText = mensaje;
    if (cuadro) cuadro.style.borderColor = "#00FF00"; 
    
    /* REINICIO DE ANIMACIÓN DE CRÉDITOS 
       Este bloque es el que hace que las letras siempre suban
    */
    if (contenedorCreditos) {
        contenedorCreditos.style.animation = 'none';
        contenedorCreditos.offsetHeight; // Truco de reflujo para resetear CSS
        
        // Ajustamos la velocidad según el largo del texto
        let velocidad = mensaje.length > 200 ? '28s' : '18s';
        contenedorCreditos.style.animation = `subirCreditos ${velocidad} linear infinite`;
    }

    setRobotEstado('hablando');

    lectura.onend = () => {
        setRobotEstado('reposo');
        // Esperamos un momento antes de activar el micrófono
        setTimeout(() => iniciarEscucha(), 700);
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
        console.warn("El micrófono ya está intentando escuchar."); 
    }
}

/* --- LÓGICA DE RESPUESTA --- */
oido.onresult = (event) => {
    const voz = event.results[0][0].transcript.toLowerCase();
    
    if (!nombreUsuario) {
        nombreUsuario = voz.replace("mi nombre es", "").replace("soy", "").trim();
        hablar(`Mucho gusto, ${nombreUsuario}. Tienes derecho a decidir sobre tu vida. Para explorar los temas por favor pronuncia algunas de estas palabras: CUERPO, MITOS o DECISIÓN.`);
    } else {
        procesarComandos(voz);
    }
};

/* --- MANEJO DE ERRORES DE AUDIO --- */
oido.onend = () => {
    const display = document.getElementById('texto-dinamico');
    if (display && display.innerText.includes("ESCUCHANDO")) {
        const msg = "No logré escucharte. Toca la pantalla o el botón ACTIVAR para intentar de nuevo.";
        display.innerText = msg;
        document.getElementById('cuadro-texto').style.borderColor = "red"; 
        
        setRobotEstado('error');
        setTimeout(() => setRobotEstado('reposo'), 1200);

        const aviso = new SpeechSynthesisUtterance("No te escuché. Toca la pantalla para reintentar.");
        aviso.voice = vozFemenina;
        sintetizador.speak(aviso);
    }
};

/* --- NAVEGACIÓN PEDAGÓGICA (CONTENIDO UNAD) --- */
function procesarComandos(comando) {
    if (comando.includes("cuerpo")) {
        hablar(`${nombreUsuario}, la dimensión biológica trata sobre tu salud y autonomía física. No se trata solo de la ausencia de enfermedad, sino del conocimiento de tu anatomía, tus sentidos y tus funciones reproductivas. Implica el derecho a recibir servicios de salud adaptados a tus necesidades, el acceso a información clara sobre higiene, prevención y la libertad de disfrutar de tu bienestar físico sin que la discapacidad sea vista como una limitación de tu integridad. ¿Quieres ver MITOS o DECISIÓN?`);
    } 
    else if (comando.includes("mitos")) {
        hablar(`Escucha bien, ${nombreUsuario}. La dimensión social rompe barreras. No hay límites para el deseo en la discapacidad. Reconoce que las personas con discapacidad son seres sexuales con derecho a amar, ser amados y expresar su erotismo sin juicios. Esta dimensión denuncia las barreras del entorno y los prejuicios de la sociedad que intentan infantilizar o invisibilizar tu sexualidad. ¿Quieres ir a CUERPO o DECISIÓN?`);
    } 
    else if (comando.includes("decisión") || comando.includes("ética") || comando.includes("decision")) {
        hablar(`${nombreUsuario}, la dimensión ética es tu poder de decidir. Se fundamenta en la autonomía y en la capacidad de elegir tus propios valores y estilo de vida. Implica el juicio crítico para distinguir entre lo que deseas y lo que otros te imponen, asegurando que el consentimiento sea siempre el pilar de tus relaciones. Es tu derecho a decir no, a decir sí, y a ser responsable de tus decisiones afectivas. ¿Quieres volver a explorar? Di: CUERPO, MITOS o INICIO.`);
    } 
    else if (comando.includes("inicio")) {
        hablar(`Hola de nuevo ${nombreUsuario}. Elige una dimensión para profundizar: CUERPO, MITOS o DECISIÓN.`);
    } 
    else {
        hablar(`No logré entenderte ${nombreUsuario}. Intenta decir una de las opciones: Cuerpo, Mitos o Decisión.`);
    }
}

/* --- FUNCIÓN DE ARRANQUE --- */
function iniciar() {
    // Desbloqueo de audio para móviles
    if (sintetizador.paused) {
        sintetizador.resume();
    }
    
    nombreUsuario = ""; 
    setRobotEstado('reposo');
    hablar("Bienvenido a este espacio seguro, soy IRIS. Mi misión es brindarte herramientas claras sobre educación sexual integral, sin barreras y con total respeto por tu diversidad. Aquí, la información es libertad y el consentimiento es nuestra base. ¿Con quién tengo el gusto de hablar?");
}

/* --- EVENTOS DE ACCESIBILIDAD --- */
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
       (display.innerText.includes("Presiona") || display.innerText.includes("No logré"))) {
        iniciar();
    }
});