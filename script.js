/// CONFIGURACIÓN DE IDENTIDAD Y MOTORES
let nombreUsuario = "";
const sintetizador = window.speechSynthesis;
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
const oido = new Reconocimiento();

oido.lang = 'es-CO';
oido.continuous = false;
oido.interimResults = false;

// FUNCIÓN PARA QUE IRIS HABLE
function hablar(mensaje) {
    sintetizador.cancel(); // Detiene cualquier audio previo
    const lectura = new SpeechSynthesisUtterance(mensaje);
    lectura.lang = 'es-CO';
    lectura.rate = 1.0;

    document.getElementById('texto-dinamico').innerText = mensaje;
    sintetizador.speak(lectura);

    // Activa el micrófono automáticamente al terminar de hablar
    lectura.onend = () => {
        iniciarEscucha();
    };
}

// FUNCIÓN PARA QUE IRIS ESCUCHE
function iniciarEscucha() {
    try {
        oido.start();
        console.log("IRIS escuchando...");
    } catch (e) {
        console.log("Micrófono ya activo");
    }
}

// PROCESAMIENTO DE LO QUE EL USUARIO DICE
oido.onresult = (event) => {
    const vozEscuchada = event.results[0][0].transcript.toLowerCase();
    console.log("Usuario dijo:", vozEscuchada);

    if (!nombreUsuario) {
        nombreUsuario = vozEscuchada;
        hablar(`Mucho gusto, ${nombreUsuario}. Tienes el derecho a recibir información clara. Di una dimensión para explorar: CUERPO, MITOS o DECISIÓN.`);
    } else {
        procesarNavegacion(vozEscuchada);
    }
};

// LÓGICA PEDAGÓGICA POR DIMENSIONES
function procesarNavegacion(comando) {
    if (comando.includes("cuerpo")) {
        hablar(`${nombreUsuario}, la dimensión biológica trata sobre tu salud y tu anatomía. ¿Quieres explorar MITOS o DECISIÓN?`);
    } 
    else if (comando.includes("mitos")) {
        hablar("La dimensión social rompe prejuicios. Las personas con discapacidad tienen derecho al deseo y al placer. ¿Qué sigue? ¿CUERPO o DECISIÓN?");
    } 
    else if (comando.includes("decisión") || comando.includes("decisión")) {
        hablar(`${nombreUsuario}, la dimensión ética es tu autonomía. Tú decides sobre tu cuerpo y das el consentimiento. Di INICIO para volver a empezar.`);
    } 
    else if (comando.includes("inicio")) {
        hablar(`Muy bien ${nombreUsuario}. Elige de nuevo: CUERPO, MITOS o DECISIÓN.`);
    } 
    else {
        hablar("No te entendí bien. Intenta decir una de las dimensiones: Cuerpo, Mitos o Decisión.");
    }
}

// INICIO DEL SISTEMA
function iniciarSistema() {
    const bienvenida = "Hola, soy I.R.I.S. Tu voz, tus derechos, tu autonomía. Soy tu guía de Educación Sexual Integral. Antes de empezar, ¿cuál es tu nombre?";
    hablar(bienvenida);
}