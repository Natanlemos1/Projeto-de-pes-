import { authenticate } from "./api/auth.js";

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const togglePasswordButton = document.querySelector("#toggle-password");
const submitButton = document.querySelector("#submit-button");
const statusMessage = document.querySelector("#login-status");

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type) {
    statusMessage.classList.add(`status-message--${type}`);
  }

  statusMessage.hidden = !message;
}

function validateCredentials(email, password) {
  if (!email) {
    emailInput.focus();
    return "Informe seu e-mail.";
  }

  if (!emailInput.validity.valid) {
    emailInput.focus();
    return "Informe um e-mail válido.";
  }

  if (!password) {
    passwordInput.focus();
    return "Informe sua senha.";
  }

  if (password.length < 6) {
    passwordInput.focus();
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  return "";
}

togglePasswordButton.addEventListener("click", () => {
  const isPasswordVisible = passwordInput.type === "text";
  passwordInput.type = isPasswordVisible ? "password" : "text";
  togglePasswordButton.textContent = isPasswordVisible ? "Mostrar" : "Ocultar";
  togglePasswordButton.setAttribute(
    "aria-label",
    isPasswordVisible ? "Mostrar senha" : "Ocultar senha",
  );
  passwordInput.focus();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const validationError = validateCredentials(email, password);

  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Entrando...";

  try {
    const session = await authenticate({ email, password });
    setStatus(`Bem-vindo, ${session.displayName}.`, "success");
    window.setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 350);
  } catch (error) {
    setStatus(
      error instanceof Error ? error.message : "Não foi possível entrar.",
      "error",
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Entrar";
  }
});
