// ==========================================
// 1. CONFIGURACIÓN DE IDENTIDAD Y MOTORES
// ==========================================
let nombreUsuario = "";
const sintetizador = window.speechSynthesis;
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;

// Verificar soporte del navegador
if (!Reconocimiento) {
    alert("Este navegador no soporta el reconocimiento de voz. Por favor, usa Google Chrome o Microsoft Edge.");
}

const oido = new Reconocimiento();
oido.lang = 'es-CO'; // Acento colombiano para mayor cercanía
oido.continuous = false;
oido.interimResults = false;

// ==========================================
// 2. FUNCIÓN DE VOZ (HABLAR)
// ==========================================
function hablar(mensaje) {
    sintetizador.cancel(); // Detener cualquier audio previo
    const lectura = new SpeechSynthesisUtterance(mensaje);
    lectura.lang = 'es-CO';
    lectura.rate = 1.0;

    // Actualización visual para baja visión
    document.getElementById('texto-dinamico').innerText = mensaje;
    
    lectura.onend = () => {
        // Retraso de seguridad para que no se escuche a sí misma
        setTimeout(() => iniciarEscucha(), 600);
    };

    sintetizador.speak(lectura);
}

// ==========================================
// 3. FUNCIÓN DE ESCUCHA (OÍR)
// ==========================================
function iniciarEscucha() {
    try {
        oido.start();
        document.getElementById('texto-dinamico').innerText = ">>> IRIS ESCUCHANDO... (Habla ahora)";
        document.getElementById('cuadro-texto').style.borderColor = "yellow"; 
    } catch (e) {
        console.log("El micrófono ya está activo.");
    }
}

// ==========================================
// 4. PROCESAMIENTO DE RESPUESTAS
// ==========================================
oido.onresult = (event) => {
    const vozEscuchada = event.results[0][0].transcript.toLowerCase();
    document.getElementById('cuadro-texto').style.borderColor = "#00FF00";

    if (!nombreUsuario) {
        // Captura del nombre para fomentar la autonomía del sujeto
        nombreUsuario = vozEscuchada;
        hablar(`Mucho gusto, ${nombreUsuario}. Como ciudadano, tienes derecho a la información. Elige una dimensión para explorar, debes pronunciar algunas e
            de estas palabras: CUERPO, MITOS o DECISIÓN.`);
    } else {
        // Navegación por las dimensiones de la ESI
        procesarNavegacion(vozEscuchada);
    }
};

// Manejo de silencios o errores
oido.onend = () => {
    if (document.getElementById('texto-dinamico').innerText.includes("ESCUCHANDO")) {
        // Cambiamos el mensaje para que el usuario sepa que puede tocar cualquier tecla
        const mensajeError = "No logré escucharte. Presiona cualquier tecla o toca la pantalla para intentar de nuevo.";
        document.getElementById('texto-dinamico').innerText = mensajeError;
        document.getElementById('cuadro-texto').style.borderColor = "red";
        
        // Opcional: Que IRIS diga que no escuchó
        const avisoVoz = new SpeechSynthesisUtterance("No logré escucharte. Toca la pantalla para intentar de nuevo.");
        avisoVoz.lang = 'es-CO';
        sintetizador.speak(avisoVoz);
    }
};

// ==========================================
// 5. LÓGICA PEDAGÓGICA (DIMENSIONES)
// ==========================================
function procesarNavegacion(comando) {
    if (comando.includes("cuerpo") || comando.includes("biológica")) {
        hablar(`${nombreUsuario}, la dimensión biológica nos enseña sobre el autocuidado y el conocimiento de nuestra anatomía. ¿Quieres ir a MITOS o DECISIÓN?`);
    } 
    else if (comando.includes("mitos") || comando.includes("social")) {
        hablar("La dimensión social nos dice que la sexualidad no tiene barreras. Es un mito que las personas con discapacidad no tengan deseos. ¿CUERPO o DECISIÓN?");
    } 
    else if (comando.includes("decisión") || comando.includes("ética") || comando.includes("consentimiento")) {
        hablar(`${nombreUsuario}, la dimensión ética trata sobre tu autonomía. Tú tienes el poder de decidir y dar tu consentimiento siempre. Di INICIO para volver.`);
    } 
    else if (comando.includes("inicio")) {
        hablar(`Perfecto ${nombreUsuario}, volvamos a empezar. Elige: CUERPO, MITOS o DECISIÓN.`);
    } 
    else {
        hablar("No comprendí esa opción. Por favor, di: Cuerpo, Mitos o Decisión.");
    }
}

// Inicio manual por interacción del usuario (Requisito de navegadores)
function iniciarSistema() {
    nombreUsuario = ""; 
    hablar("Hola, soy IRIS. Interfaz de Respuesta Integral y Sensorial. ¿Podrías decirme tu nombre?");
}

// ACTIVADORES DE ACCESIBILIDAD GLOBAL
// 1. Si presiona cualquier tecla
window.addEventListener('keydown', () => {
    if (document.getElementById('cuadro-texto').style.borderColor === "red") {
        iniciarSistema();
    }
});

// 2. Si toca cualquier parte de la pantalla (para tablets o celulares)
window.addEventListener('click', (e) => {
    // Evitamos que se dispare si ya hizo clic en el botón (para no duplicar)
    if (e.target.id !== "btn-iniciar" && document.getElementById('cuadro-texto').style.borderColor === "red") {
        iniciarSistema();
    }
});