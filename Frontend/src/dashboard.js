import {
  listCompanies,
  saveCompany,
  removeCompany,
  listClients,
  saveClient,
  removeClient,
} from "./api/management.js";

const companiesNav = document.querySelector("#companies-nav");
const clientsNav = document.querySelector("#clients-nav");
const pageTitle = document.querySelector("#page-title");
const newButton = document.querySelector("#new-button");
const tableHead = document.querySelector("#table-head");
const tableBody = document.querySelector("#table-body");
const statusMessage = document.querySelector("#status-message");
const recordDialog = document.querySelector("#record-dialog");
const recordForm = document.querySelector("#record-form");
const dialogTitle = document.querySelector("#dialog-title");
const dialogBody = document.querySelector("#dialog-body");
const closeDialogButton = document.querySelector("#close-dialog");
const cancelButton = document.querySelector("#cancel-button");
const logoutButton = document.querySelector("#logout-button");

let currentSection = "companies";
let editingId = null;
let companies = [];
let clients = [];

const companyFields = [
  { name: "name", label: "Nome da empresa", type: "text", required: true, full: true },
  { name: "cnpj", label: "CNPJ", type: "text", required: true },
  { name: "phone", label: "Telefone", type: "tel", required: true },
  { name: "address", label: "Endereço", type: "text", required: true, full: true },
  { name: "representative", label: "Representante", type: "text", required: true },
  { name: "catalog", label: "Catálogo de produtos", type: "text", required: true },
];

const clientFields = [
  { name: "name", label: "Nome do cliente", type: "text", required: true, full: true },
  { name: "document", label: "CNPJ ou CPF", type: "text", required: true },
  { name: "phone", label: "Telefone", type: "tel", required: true },
  { name: "email", label: "E-mail", type: "email", required: true },
  { name: "address", label: "Endereço", type: "text", required: true, full: true },
  { name: "companyId", label: "Empresa representada", type: "select", required: true },
];

function setStatus(message = "") {
  statusMessage.textContent = message;
  statusMessage.hidden = !message;
}

function escapeText(value) {
  const element = document.createElement("span");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

function setActiveSection(section) {
  currentSection = section;
  const isCompanies = section === "companies";
  pageTitle.textContent = isCompanies ? "Gerenciar empresa" : "Gerenciar cliente";
  companiesNav.setAttribute("aria-current", isCompanies ? "page" : "false");
  clientsNav.setAttribute("aria-current", isCompanies ? "false" : "page");
  renderTable();
}

function renderTable() {
  setStatus("");

  if (currentSection === "companies") {
    tableHead.innerHTML =
      "<tr><th>Empresa</th><th>CNPJ</th><th>Telefone</th><th>Representante</th><th>Ações</th></tr>";
    tableBody.innerHTML = companies.length
      ? companies
          .map(
            (company) => `
              <tr>
                <td>${escapeText(company.name)}</td>
                <td>${escapeText(company.cnpj)}</td>
                <td>${escapeText(company.phone)}</td>
                <td>${escapeText(company.representative)}</td>
                <td>
                  <button class="icon-button" type="button" data-action="edit" data-id="${company.id}">Editar</button>
                  <button class="icon-button" type="button" data-action="remove" data-id="${company.id}">Excluir</button>
                </td>
              </tr>`,
          )
          .join("")
      : '<tr><td colspan="5"><p class="empty-state">Nenhuma empresa cadastrada.</p></td></tr>';
    return;
  }

  tableHead.innerHTML =
    "<tr><th>Cliente</th><th>Documento</th><th>Telefone</th><th>Empresa</th><th>Ações</th></tr>";
  tableBody.innerHTML = clients.length
    ? clients
        .map((client) => {
          const company = companies.find((item) => item.id === client.companyId);
          return `
            <tr>
              <td>${escapeText(client.name)}</td>
              <td>${escapeText(client.document)}</td>
              <td>${escapeText(client.phone)}</td>
              <td>${escapeText(company?.name ?? "Não informado")}</td>
              <td>
                <button class="icon-button" type="button" data-action="edit" data-id="${client.id}">Editar</button>
                <button class="icon-button" type="button" data-action="remove" data-id="${client.id}">Excluir</button>
              </td>
            </tr>`;
        })
        .join("")
    : '<tr><td colspan="5"><p class="empty-state">Nenhum cliente cadastrado.</p></td></tr>';
}

function buildFields(fields, record) {
  dialogBody.innerHTML = fields
    .map((field) => {
      const value = record?.[field.name] ?? "";
      const fullClass = field.full ? " form-field--full" : "";

      if (field.type === "select") {
        const options = companies
          .map(
            (company) =>
              `<option value="${company.id}" ${String(company.id) === String(value) ? "selected" : ""}>${escapeText(company.name)}</option>`,
          )
          .join("");
        return `
          <div class="form-field${fullClass}">
            <label for="${field.name}">${escapeText(field.label)}</label>
            <select id="${field.name}" name="${field.name}" ${field.required ? "required" : ""}>
              <option value="">Selecione</option>
              ${options}
            </select>
          </div>`;
      }

      return `
        <div class="form-field${fullClass}">
          <label for="${field.name}">${escapeText(field.label)}</label>
          <input
            id="${field.name}"
            name="${field.name}"
            type="${field.type}"
            value="${escapeText(value)}"
            maxlength="${field.name === "address" ? "180" : "120"}"
            ${field.required ? "required" : ""}
          />
        </div>`;
    })
    .join("");
}

function openDialog(record = null) {
  editingId = record?.id ?? null;
  dialogTitle.textContent = editingId ? "Editar cadastro" : "Novo cadastro";
  buildFields(currentSection === "companies" ? companyFields : clientFields, record);
  recordDialog.showModal();
}

async function refreshData() {
  try {
    [companies, clients] = await Promise.all([listCompanies(), listClients()]);
    setActiveSection(currentSection);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Não foi possível carregar os dados.");
  }
}

recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(recordForm);
  const record = Object.fromEntries(formData.entries());

  for (const [key, value] of Object.entries(record)) {
    record[key] = String(value).trim();
  }

  if (!Object.values(record).every((value) => value)) {
    setStatus("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    if (currentSection === "companies") {
      await saveCompany({ ...record, id: editingId });
    } else {
      await saveClient({ ...record, id: editingId, companyId: Number(record.companyId) });
    }
    recordDialog.close();
    await refreshData();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Não foi possível salvar.");
  }
});

tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    const record =
      currentSection === "companies"
        ? companies.find((item) => item.id === id)
        : clients.find((item) => item.id === id);
    if (record) {
      openDialog(record);
    }
    return;
  }

  if (action === "remove") {
    const confirmed = window.confirm(
      currentSection === "companies"
        ? "Deseja excluir esta empresa?"
        : "Deseja excluir este cliente?",
    );
    if (!confirmed) {
      return;
    }

    try {
      if (currentSection === "companies") {
        await removeCompany(id);
      } else {
        await removeClient(id);
      }
      await refreshData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível excluir.");
    }
  }
});

companiesNav.addEventListener("click", () => setActiveSection("companies"));
clientsNav.addEventListener("click", () => setActiveSection("clients"));
newButton.addEventListener("click", () => openDialog());
closeDialogButton.addEventListener("click", () => recordDialog.close());
cancelButton.addEventListener("click", () => recordDialog.close());
logoutButton.addEventListener("click", () => {
  window.location.href = "./index.html";
});

refreshData();
