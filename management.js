const companies = [
  {
    id: 1,
    name: "Mercado Bom Preço Ltda.",
    phone: "(45) 3221-1000",
    address: "Rua das Flores, 125",
    cnpj: "12.345.678/0001-90",
    representative: "Ana Souza",
    catalog: "Alimentos",
  },
];

const clients = [
  {
    id: 1,
    name: "Distribuidora Alfa",
    document: "23.456.789/0001-10",
    phone: "(45) 3222-2000",
    email: "contato@distribuidoraalfa.com",
    address: "Av. Brasil, 300",
    companyId: 1,
  },
];

function wait(milliseconds = 120) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function nextId(items) {
  return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
}

export async function listCompanies() {
  await wait();
  return [...companies];
}

export async function saveCompany(company) {
  await wait();

  if (company.id) {
    const index = companies.findIndex((item) => item.id === company.id);
    if (index === -1) {
      throw new Error("Empresa não encontrada.");
    }
    companies[index] = { ...company };
    return companies[index];
  }

  const savedCompany = { ...company, id: nextId(companies) };
  companies.push(savedCompany);
  return savedCompany;
}

export async function removeCompany(id) {
  await wait();
  const index = companies.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Empresa não encontrada.");
  }

  const hasClient = clients.some((client) => client.companyId === id);
  if (hasClient) {
    throw new Error("Não é possível excluir uma empresa vinculada a clientes.");
  }

  companies.splice(index, 1);
}

export async function listClients() {
  await wait();
  return [...clients];
}

export async function saveClient(client) {
  await wait();

  if (client.id) {
    const index = clients.findIndex((item) => item.id === client.id);
    if (index === -1) {
      throw new Error("Cliente não encontrado.");
    }
    clients[index] = { ...client };
    return clients[index];
  }

  const savedClient = { ...client, id: nextId(clients) };
  clients.push(savedClient);
  return savedClient;
}

export async function removeClient(id) {
  await wait();
  const index = clients.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Cliente não encontrado.");
  }
  clients.splice(index, 1);
}
