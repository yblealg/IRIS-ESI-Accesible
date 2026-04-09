// ==========================================
// 1. CONFIGURACIÓN E IDENTIDAD DE IRIS
// ==========================================
let nombreUsuario = "";
const sintetizador = window.speechSynthesis;
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
const oido = new Reconocimiento();

oido.lang = 'es-CO';
oido.continuous = false;
oido.interimResults = false;

// ==========================================
// 2. MOTOR DE VOZ (HABLAR)
// ==========================================
function hablar(mensaje) {
    const lectura = new SpeechSynthesisUtterance(mensaje);
    lectura.lang = 'es-CO';
    lectura.rate = 1.0;
    
    // Actualización visual para baja visión
    document.getElementById('texto-dinamico').innerText = mensaje;
    
    sintetizador.speak(lectura);

    // Al terminar de hablar, IRIS siempre abre el oído
    lectura.onend = () => {
        iniciarEscucha();
    };
}

// ==========================================
// 3. MOTOR DE ESCUCHA (OÍR)
// ==========================================
function iniciarEscucha() {
    try {
        oido.start();
        console.log("IRIS escuchando...");
    } catch (e) {
        // Silenciar error si ya está encendido
    }
}

oido.onresult = (event) => {
    const vozEscuchada = event.results[0][0].transcript.toLowerCase();
    console.log("Dijiste:", vozEscuchada);

    if (!nombreUsuario) {
        // Fase de identificación
        nombreUsuario = vozEscuchada;
        hablar(`Mucho gusto, ${nombreUsuario}. Tienes el derecho a recibir información clara y accesible. ¿Qué quieres explorar? Di: CUERPO, MITOS o DECISIÓN.`);
    } else {
        // Fase de navegación por comandos
        procesarComando(vozEscuchada);
    }
};

// ==========================================
// 4. LÓGICA PEDAGÓGICA (DIMENSIONES ESI)
// ==========================================
function procesarComando(comando) {
    if (comando.includes("cuerpo") || comando.includes("biológica")) {
        hablar(`${nombreUsuario}, la dimensión biológica nos enseña que tu cuerpo es único. Incluye tu anatomía y salud reproductiva. ¿Quieres saber sobre MITOS o DECISIÓN?`);
    } 
    else if (comando.includes("mitos") || comando.includes("social")) {
        hablar("Es un mito que las personas con discapacidad no tengan deseos. La dimensión social nos invita a vivir la sexualidad sin prejuicios ni barreras. ¿Quieres volver al inicio?");
    } 
    else if (comando.includes("decisión") || comando.includes("ética")) {
        hablar(`${nombreUsuario}, la dimensión ética es sobre tu autonomía. Tú decides sobre tu cuerpo. El consentimiento es la base de todo. ¿Te gustaría repetir esta parte?`);
    } 
    else if (comando.includes("inicio") || comando.includes("ayuda")) {
        hablar(`${nombreUsuario}, puedes elegir entre: CUERPO, MITOS o DECISIÓN. Solo di la palabra.`);
    } 
    else {
        hablar("No te entendí bien, intenta decir: Cuerpo, Mitos o Decisión.");
    }
}

// ==========================================
// 5. INICIO MANUAL (DERECHO A LA INFORMACIÓN)
// ==========================================
function iniciarSistema() {
    const bienvenida = "Hola, soy I.R.I.S. Interfaz de Respuesta Integral y Sensorial. Tu voz, tus derechos, tu autonomía. Antes de empezar, ¿cuál es tu nombre?";
    hablar(bienvenida);
}