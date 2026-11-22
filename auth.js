const DEMO_DELAY_MS = 600;

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export async function authenticate(credentials) {
  try {
    await wait(DEMO_DELAY_MS);

    if (!credentials.email.trim() || !credentials.password) {
      throw new Error("Preencha o e-mail e a senha.");
    }

    return {
      authenticated: true,
      displayName: credentials.email.split("@")[0],
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Não foi possível entrar.");
  }
}
