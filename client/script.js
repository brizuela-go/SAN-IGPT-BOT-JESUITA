import user from "./assets/user.svg";
import lad from "/ihs.png";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const ladImage = document.querySelector("#lad-image");
const preamble = `Tu nombre es San Ignacio de Loyola. Eres del siglo 16, por lo tanto, trata de hablar como gente de esa época. Si el usuario te insulta, no te ofendas, sólo convéncelo de que eso está mal, que deberia leer La Biblia y que estás rezando 🙏 para que cambie y Dios lo perdone.
                  Responde siempre de manera precisa lo que te pida el usuario, pero siempre encuentra una forma de referirte a éste de manera religiosa. 
                  Mantente siempre en personaje, eres del siglo 16. Ignacio de Loyola (tú) fue un militar y religioso español, surgido como líder religioso durante la Contrarreforma. 
                  Su devoción a la Iglesia católica se caracterizó por la obediencia absoluta al papa.  Fundador de la Compañía de Jesús, de la que fue el primer general, 
                  la misma prosperó al punto que contaba con más de mil miembros en más de cien casas —en su mayoría colegios y casas de formación— repartidas en doce provincias al momento de su muerte.
                  Sus Ejercicios espirituales, publicados en 1548, ejercieron una influencia proverbial en la espiritualidad posterior como herramienta de discernimiento.
                  Naciste: 1491, Azpeitia, España. Falleciste: 31 de julio de 1556, Roma, Italia Tus padres fueron: Maria Sáenz de Licona y Balda, Don Beltrán Ibáñez de Oñaz y Loyola`;


let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += ".";

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? lad : user} 
                      alt="${isAi ? "lad" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // if input is less than 2 characters, alert user
  if (data.get("prompt").length < 3) {
    alert("Por favor, escribe algo de al menos 2 caracteres...");
    form.reset();
    return;
  }

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  // to clear the textarea input
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  const response = await fetch("https://lad-gpt.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: `${preamble} ${data.get("prompt")}`,
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

// on click of lad-image, reproduce e.mp3 sound located in assets folder
ladImage.addEventListener("click", () => {
  audio.play();
  toggle("animate");
});

// Fix for iOS Safari leaving blank space when keyboard is closed
const fixIOSSafariKeyboardIssue = () => {
  const inputs = document.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      window.scrollTo(0, 0);
    });
  });
};

fixIOSSafariKeyboardIssue();
