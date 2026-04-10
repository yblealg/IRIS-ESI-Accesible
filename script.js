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
    else if (comando.includes("decisión") || comando.includes("ética")) {
        hablar(`${nombreUsuario}, la dimensión ética es tu poder de decidir. Se fundamenta en la autonomía y en la capacidad de elegir tus propios valores y estilo de vida. ` +
               `Implica el juicio crítico para distinguir entre lo que deseas y lo que otros te imponen, asegurando que el consentimiento sea siempre el pilar de tus relaciones. ` +
               `Es tu derecho a decir no, a decir sí, y a ser responsable de tus decisiones afectivas en un marco de respeto y libertad personal. ` +
               `¿Quieres volver a explorar? Di: CUERPO, MITOS o INICIO.`);
    } 
    else if (comando.includes("inicio")) {
        hablar(`Hola de nuevo ${nombreUsuario}. Elige una dimensión para profundizar: CUERPO, MITOS o DECISIÓN.`);
    } 
    else {
        hablar("No logré entenderte. Intenta decir una de las opciones: Cuerpo, Mitos o Decisión.");
    }
}

// ACTIVACIÓN DEL SISTEMA
function iniciarSistema() {
    nombreUsuario = ""; 
    hablar("Hola, soy IRIS. Tu guía de educación sexual. ¿Cuál es tu nombre?");
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