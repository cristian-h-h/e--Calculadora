// Función para agregar valores a la pantalla
function appendValue(value) {
    const resultField = document.getElementById('result');
    const lastChar = resultField.value.slice(-1); // Obtiene el último carácter

    // Evita agregar operadores consecutivos
    if (['+', '-', '*', '/', '^', '%'].includes(value) && ['+', '-', '*', '/', '^', '%'].includes(lastChar)) {
        return;
    }

    // Si el campo está en "0" y el valor no es un punto, reemplaza el "0"
    if (resultField.value === "0" && value !== '.' && value !== 'h' && value !== 'm' && value !== 's') {
        resultField.value = value;
    } else if (value === '.') {
        // Evita agregar más de un punto decimal por número
        const parts = resultField.value.split(/[\+\-\*\/\^\%]/); // Divide la expresión en partes
        const lastPart = parts[parts.length - 1]; // Obtiene la última parte (número actual)
        if (!lastPart.includes('.')) { // Si no tiene un punto decimal, agrega uno
            resultField.value += value;
        }
    } else {
        resultField.value += value; // Agrega el valor al campo
    }

    // Reemplaza '**' por '^' en el visor (solo visualmente)
    resultField.value = resultField.value.replace(/\*\*/g, '^');
}

// Función para limpiar la pantalla
function clearResult() {
    document.getElementById('result').value = '0';
}

// Función para borrar el último carácter
function undoLastCharacter() {
    const resultField = document.getElementById('result');
    resultField.value = resultField.value.slice(0, -1) || '0'; // Borra el último carácter
}

// Función para calcular la raíz cuadrada
function calculateSquareRoot() {
    const resultField = document.getElementById('result');
    const value = parseFloat(resultField.value);

    if (!isNaN(value) && value >= 0) {
        const result = Math.sqrt(value);
        resultField.value = result;
    } else {
        resultField.value = 'Error';
    }
}

// Función para calcular el resultado
function calculateResult() {
    const resultField = document.getElementById('result');
    try {
        // Reemplaza 'x' por '*' para la multiplicación
        let expression = resultField.value.replace(/x/g, '*');

        // Reemplaza '^' por '**' para la potencia (internamente)
        expression = expression.replace(/\^/g, '**');

        // Maneja el operador '%'
        expression = expression.replace(/(\d+)\%/g, (match, p1) => {
            return `${parseFloat(p1) / 100}`; // Convierte el porcentaje a decimal
        });

        // Verifica si la expresión contiene horas, minutos o segundos
        const hasTimeFormat = /[hms]/.test(expression);

        if (hasTimeFormat) {
            // Convierte horas, minutos y segundos a segundos
            expression = expression.replace(/(\d+)h/g, (match, p1) => `${parseFloat(p1) * 3600}`)
                                  .replace(/(\d+)m/g, (match, p1) => `${parseFloat(p1) * 60}`)
                                  .replace(/(\d+)s/g, (match, p1) => `${parseFloat(p1)}`);

            // Calcula el resultado en segundos
            const totalSeconds = eval(expression);

            // Convierte el resultado de vuelta a horas, minutos y segundos
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            // Muestra el resultado en formato "Xh Ym Zs"
            let result = '';
            if (hours > 0) result += `${hours}h `;
            if (minutes > 0) result += `${minutes}m `;
            if (seconds > 0) result += `${seconds}s`;
            resultField.value = result.trim() || '0s'; // Si no hay resultado, muestra "0s"
        } else {
            // Si no hay formato de tiempo, calcula el resultado normalmente
            const result = eval(expression);
            resultField.value = result;
        }
    } catch (e) {
        resultField.value = 'Error';
    }
}

// Captura eventos del teclado
document.addEventListener('keydown', (event) => {
    const key = event.key; // Obtiene la tecla presionada

    // Si la tecla es un número (0-9), un punto (.) o un operador (+, -, *, /, ^, %)
    if (/[0-9.\+\-\*\/\^\%]/.test(key)) {
        appendValue(key);
    }

    // Si la tecla es "Enter" o "=", calcula el resultado
    else if (key === 'Enter' || key === '=') {
        calculateResult();
    }

    // Si la tecla es "Backspace", borra el último carácter
    else if (key === 'Backspace') {
        undoLastCharacter();
    }

    // Si la tecla es "Escape", limpia la pantalla
    else if (key === 'Escape') {
        clearResult();
    }

    // Si la tecla es "h", "m" o "s", agrega horas, minutos o segundos
    else if (key === 'h' || key === 'm' || key === 's') {
        appendValue(key);
    }
});

// Variables para controlar el arrastre
let isDragging = false;
let offsetX, offsetY;

// Obtén el elemento de la calculadora
const calculator = document.querySelector('.calculator');

// Restaurar la posición guardada
const savedPosition = JSON.parse(localStorage.getItem('calculatorPosition')) || { left: 0, top: 0 };
calculator.style.left = `${savedPosition.left}px`;
calculator.style.top = `${savedPosition.top}px`;

// Función para iniciar el arrastre
function startDrag(event) {
    isDragging = true;
    const rect = calculator.getBoundingClientRect();
    offsetX = (event.clientX || event.touches[0].clientX) - rect.left;
    offsetY = (event.clientY || event.touches[0].clientY) - rect.top;
    calculator.style.cursor = 'grabbing'; // Cambia el cursor al hacer clic
}

// Función para mover la calculadora
function moveDrag(event) {
    if (isDragging) {
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;

        // Calcula la nueva posición de la calculadora
        let newX = clientX - offsetX;
        let newY = clientY - offsetY;

        // Limita el movimiento dentro de la ventana
        const maxX = window.innerWidth - calculator.offsetWidth;
        const maxY = window.innerHeight - calculator.offsetHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // Aplica la nueva posición
        calculator.style.left = `${newX}px`;
        calculator.style.top = `${newY}px`;
    }
}

// Función para detener el arrastre
function stopDrag() {
    if (isDragging) {
        isDragging = false;
        calculator.style.cursor = 'grab'; // Restaura el cursor al soltar

        // Guarda la posición en localStorage
        const position = {
            left: parseInt(calculator.style.left),
            top: parseInt(calculator.style.top),
        };
        localStorage.setItem('calculatorPosition', JSON.stringify(position));
    }
}

// Eventos de mouse
calculator.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', moveDrag);
document.addEventListener('mouseup', stopDrag);

// Eventos táctiles
calculator.addEventListener('touchstart', startDrag, { passive: false });
document.addEventListener('touchmove', moveDrag, { passive: false });
document.addEventListener('touchend', stopDrag);