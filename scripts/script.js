const lightTheme = "styles/light.css";
const darkTheme = "styles/dark.css";
const lightmodeIcon = "assets/lightmode.svg";
const darkmodeIcon = "assets/darkmode.svg";
const themeIcon = document.getElementById("theme-icon");
const res = document.getElementById("result");
const toast = document.getElementById("toast");
let isDarkMode = false;

function formatResult(value) {
  if (value.toString().length > 15) {
    return parseFloat(value.toExponential(2)); // Show exponential notation with 2 significant digits
  } else if (value % 1 !== 0) {
    return parseFloat(value.toFixed(2)); // Round to 2 decimal places
  } else {
    return value; // Show integer results as is
  }
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculate(value) {
  let expression = value
    .replace(/÷/g, "/")
    .replace(/x/g, "*")
    .replace(/%/g, "/100");

  try {
    // Handle power operation
    if (expression.includes("^")) {
      const [base, exponent] = expression.split("^").map(Number);
      expression = `Math.pow(${base}, ${exponent})`;
    }

    // Handle square root
    if (expression.includes("√")) {
      const number = parseFloat(expression.split("√")[1]);
      expression = `Math.sqrt(${number})`;
    }

    // Handle trigonometric functions
    expression = expression
      .replace(/sin\(([^)]+)\)/g, (_, angle) => `Math.sin(${toRadians(parseFloat(angle))})`)
      .replace(/cos\(([^)]+)\)/g, (_, angle) => `Math.cos(${toRadians(parseFloat(angle))})`)
      .replace(/tan\(([^)]+)\)/g, (_, angle) => `Math.tan(${toRadians(parseFloat(angle))})`);

    // Handle log
    expression = expression.replace(/log\(([^)]+)\)/g, (_, number) => `Math.log10(${parseFloat(number)})`);

    const calculatedValue = eval(expression || null);

    if (isNaN(calculatedValue)) {
      res.value = "Error";
      setTimeout(() => {
        res.value = "";
      }, 1300);
    } else {
      res.value = formatResult(calculatedValue);
    }
  } catch (error) {
    res.value = "Error";
    setTimeout(() => {
      res.value = "";
    }, 1300);
  }
}

function toggleVoiceControl() {
  if (isRecognitionActive) {
    recognition.stop();
    isRecognitionActive = false;
    console.log('Voice recognition stopped');
  } else {
    startVoiceControl();
  }
}

function startVoiceControl() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      console.log('Permission granted');

      if ('SpeechRecognition' in window) {
        recognition = new window.SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-UK';

        recognition.addEventListener('result', (e) => {
          let transcript = '';
          for (let i = 0; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          console.log('Transcript:', transcript.trim());

          res.value = transcript.trim();
          calculate(transcript.trim());
        });

        recognition.addEventListener('end', () => {
          console.log('Speech recognition has ended');
          if (isRecognitionActive) recognition.start(); // Restart recognition if it was stopped by itself
        });

        recognition.start();
        isRecognitionActive = true;
        console.log('Voice recognition started');
      } else {
        console.log('Speech recognition is not supported');
      }
    })
    .catch(error => {
      console.log('Error occurred:', error);
    });
}

function changeTheme() {
  const theme = document.getElementById("theme");
  setTimeout(() => {
    toast.innerHTML = "Calculator";
  }, 1500);
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    theme.setAttribute("href", darkTheme);
    themeIcon.setAttribute("src", darkmodeIcon);
    toast.innerHTML = "Dark Mode ";
  } else {
    theme.setAttribute("href", lightTheme);
    themeIcon.setAttribute("src", lightmodeIcon);
    toast.innerHTML = "Light Mode ";
  }
}

class Calculator {
  constructor() {
    this.clearAll();
  }

  clearAll() {
    res.value = '';
  }

  attachNumber(number) {
    res.value += number.toString();
  }

  delete() {
    res.value = res.value.slice(0, -1);
  }

  percent() {
    let value = parseFloat(res.value);
    const computation = value / 100;
    res.value = computation;
  }

  compute() {
    calculate(res.value);
  }

  updateOutput() {
    // Update the display if necessary
  }

  startVoiceControl() {
    toggleVoiceControl();
  }
}

const calculator = new Calculator();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".button-row input[type='button']").forEach(button => {
    button.addEventListener("click", function () {
      const value = this.value;
      liveScreen(value);
    });
  });

  document.getElementById("equals").addEventListener("click", function () {
    calculator.compute();
  });

  document.getElementById("clear").addEventListener("click", function () {
    calculator.clearAll();
  });

  document.getElementById("voice").addEventListener("click", function () {
    calculator.startVoiceControl();
  });

  document.getElementById("theme-toggle").addEventListener("click", function () {
    changeTheme();
  });
});

function liveScreen(value) {
  if (value === "sin" || value === "cos" || value === "tan" || value === "log" || value === "sqrt") {
    res.value += value + "(";
  } else if (value === "^" || value === "√" || value === "%") {
    res.value += value;
  } else {
    res.value += value;
  }
}

const backspaceButton = document.getElementById("backspace-button");
const resultInput = document.getElementById("result");

backspaceButton.addEventListener("click", function() {
  resultInput.value = resultInput.value.slice(0, -1);
});