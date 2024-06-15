const lightTheme = "styles/light.css";
const darkTheme = "styles/dark.css";
const lightmodeIcon = "assets/lightmode.svg";
const darkmodeIcon = "assets/darkmode.svg";
const themeIcon = document.getElementById("theme-icon");
const res = document.getElementById("result");
const toast = document.getElementById("toast");
let isDarkMode = false;

function calculate(value) {
  const expression = value
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/times/g, "*")
    .replace(/divided by/g, "/");

  try {
    const calculatedValue = eval(expression || null);
    
    if (isNaN(calculatedValue)) {
      res.value = "Error";
      setTimeout(() => {
        res.value = "";
      }, 1300);
    } else {
      res.value = calculatedValue;
    }
  } catch (error) {
    res.value = "Error";
    setTimeout(() => {
      res.value = "";
    }, 1300);
  }
}

function startVoiceControl(calculator) {
  navigator.mediaDevices.getUserMedia({ audio: true })
   .then(stream => {
      console.log('Permission granted');

      if ('SpeechRecognition' in window) {
        const recognition = new window.SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.addEventListener('result', (e) => {
          let transcript = '';
          for (let i = 0; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          console.log('Transcript:', transcript.trim());

          if (calculator) {
            calculator.updateOutput(transcript.trim());
          } else {
            res.value = transcript.trim();
            calculate(transcript.trim());
          }
        });

        recognition.addEventListener('end', () => {
          console.log('Speech recognition has ended');
        });

        recognition.start();
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
  constructor(previousElement, currentElement) {
      this.previousElement = previousElement
      this.currentElement = currentElement
      this.voiceStart = false
      this.clearAll()
  }

  // Clear All function of the AC button
  clearAll(){
      this.currentOperand = ''
      this.previousOperand = ''
      this.symbol = undefined
  }

  // Delete function of the Delete button
  delete(){
      this.currentOperand = this.currentOperand.slice(0, -1)
  }

  // Percent button function
  percent(){
      let lolz = parseFloat(this.currentOperand)
      const computation = lolz / 100
      this.currentOperand = computation
  }

  // Function to select operation and compute when there's an input in the previous operand
  selectSymbol(symbol){
      if (this.currentOperand === '') return
      if (this.previousOperand!== ''){
          this.compute()
      }
      this.symbol = symbol
      this.previousOperand = this.currentOperand
      this.currentOperand = ''
  }

  // Concatenate numbers so it doesn't add when numbers are clicked
  attachNumber(number){
      // To allow only one '.' in the current operand 
      if (number === '.' && this.currentOperand.includes('.')) return
      // To set the maximum number of the current operand to max of 15
      if(this.currentOperand.length <= 15){
          this.currentOperand = this.currentOperand.toString() + number.toString()
      } 
  }

  // Compute function to carry out all arithmetic operations
  compute(){
      let computation
      const prev = parseFloat(this.previousOperand)
      const current = parseFloat(this.currentOperand)
      if (isNaN(prev) || isNaN(current)) return
      switch (this.symbol) {
          case '+': 
              computation = prev + current
              break
          case '-': 
              computation = prev - current
              break
          case 'x':
              computation = prev * current
              break
          case '÷':
              computation = prev / current
              break
          default:
              return
      }
      this.currentOperand = computation
      this.symbol = undefined
      this.previousOperand = ''
      if (this.voiceStart) {
          this.speak();
      }
  }

  // Adding commas to seperate larger numbers
  getDisplayNumber(number){
      const stringNumber = number.toString()
      const integerDigits = parseFloat(stringNumber.split('.')[0])
      const decimalDigits = stringNumber.split('.')[1]
      let integerDisplay 
      if (isNaN(integerDigits)){
          integerDisplay = ''
      }else {
          integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0})
      }
      if (decimalDigits!= null) {
          return `${integerDisplay}.${decimalDigits}`
      }else {
          return integerDisplay
      }
  }

  // Updates output after every input
  updateOutput(val){   
      this.currentElement.innerText = this.getDisplayNumber(this.currentOperand)
      if (this.symbol!= null) {
          this.previousElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.symbol}`
      } else {
          this.previousElement.innerText = ''
      }
      if (val!= null){
          // console.log(`there's a voice input`)
          this.currentOperand = val
          this.previousElement.innerText = this.currentOperand
          this.currentElement.innerText = eval(this.currentOperand)
          this.speak()
      }
  }

  // Voice command
  voice(val) {
      this.voiceStart = val;
  }
  speak() {
      // Set the text and voice attributes.
      let speech = new window.SpeechSynthesisUtterance();
      speech.text = `Your answer is ${eval(this.currentOperand)}`
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
      speech.onend = ()=>{alat()}
      speech.addEventListener('onend', toggle)
  }

  // Mic button trigger
  startVoiceControl() {
      startVoiceControl(this);
  }
}

// Create a new instance of the Calculator class
const calculator = new Calculator(previousElement, currentElement);

// Add event listeners for the calculator buttons
document.addEventListener("DOMContentLoaded", function() {
  // Add event listeners for the calculator buttons
  document.querySelectorAll(".button").forEach(button => {
    button.addEventListener("click", function() {
      const value = this.textContent;
      calculator.attachNumber(value);
      calculator.updateOutput();
    });
  });

  // Add event listener for the equals button
  document.getElementById("equals").addEventListener("click", function() {
    calculator.compute();
    calculator.updateOutput();
  });

  // Add event listener for the clear button
  document.getElementById("clear").addEventListener("click", function() {
    calculator.clearAll();
    calculator.updateOutput();
  });

  // Add event listener for the voice button
  document.getElementById("voice").addEventListener("click", function() {
    calculator.startVoiceControl();
  });

  // Add event listener for the theme toggle button
  document.getElementById("theme-toggle").addEventListener("click", function() {
    changeTheme();
  });
});