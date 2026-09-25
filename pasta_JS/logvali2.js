"use strict";

// Demonstração local. O armazenamento do navegador não autentica usuários reais.
document.addEventListener("DOMContentLoaded", () => {
  const USER_KEY = "gpsBrasilia_usuarios";
  const SESSION_KEY = "gpsBrasilia_sessao";
  const login = document.querySelector("#form-login");
  const cadastro = document.querySelector("#form-cadastro");
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const mensagens = { login: document.querySelector("#msg-login"), cadastro: document.querySelector("#msg-cadastro") };
  if (!login || !cadastro || !mensagens.login || !mensagens.cadastro) return;

  const emailNormalizado = value => value.trim().toLowerCase();
  function mensagem(tipo, texto, classe = "erro") {
    mensagens[tipo].textContent = texto;
    mensagens[tipo].className = `mensagem-alerta ${classe}`;
  }
  function limparMensagens() {
    for (const elemento of Object.values(mensagens)) {
      elemento.textContent = "";
      elemento.className = "mensagem-alerta";
    }
  }
  function mostrarAba(tipo) {
    const isLogin = tipo === "login";
    login.hidden = !isLogin;
    cadastro.hidden = isLogin;
    tabs.forEach(tab => {
      const ativa = tab.dataset.tab === tipo;
      tab.classList.toggle("active", ativa);
      tab.setAttribute("aria-selected", String(ativa));
    });
    limparMensagens();
  }
  tabs.forEach(tab => tab.addEventListener("click", () => mostrarAba(tab.dataset.tab)));
  for (const tab of tabs) {
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const next = tab.dataset.tab === "login" ? "cadastro" : "login";
      mostrarAba(next);
      tabs.find(item => item.dataset.tab === next)?.focus();
    });
  }
  document.querySelectorAll("[data-target]").forEach(button => {
    button.addEventListener("click", () => {
      const field = document.getElementById(button.dataset.target);
      if (!field) return;
      const visible = field.type === "password";
      field.type = visible ? "text" : "password";
      button.textContent = visible ? "Ocultar" : "Mostrar";
      button.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
    });
  });

  function usuarios() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Lista de usuários inválida");
    return parsed;
  }
  function salvar(lista) { localStorage.setItem(USER_KEY, JSON.stringify(lista)); }
  async function hashPassword(password, salt) {
    if (!crypto?.subtle) throw new Error("Abra pelo Live Server em http://localhost ou por HTTPS.");
    const data = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  cadastro.addEventListener("submit", async event => {
    event.preventDefault();
    limparMensagens();
    if (!cadastro.reportValidity()) return;
    const nome = cadastro.elements.nome.value.trim();
    const email = emailNormalizado(cadastro.elements.email.value);
    const senha = cadastro.elements.senha.value;
    const confirmacao = cadastro.elements.confirmacao.value;
    if (nome.length < 3) { mensagem("cadastro", "Digite um nome com pelo menos 3 caracteres."); return; }
    if (senha.length < 8 || !/[a-zA-ZÀ-ÿ]/.test(senha) || !/\d/.test(senha)) {
      mensagem("cadastro", "Use uma senha com 8 caracteres ou mais, uma letra e um número."); return;
    }
    if (senha !== confirmacao) { mensagem("cadastro", "As senhas não coincidem."); return; }
    const button = cadastro.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const lista = usuarios();
      if (lista.some(user => emailNormalizado(user.email ?? "") === email)) {
        mensagem("cadastro", "Este e-mail já foi cadastrado neste navegador.");
        return;
      }
      const salt = crypto.randomUUID();
      const senhaHash = await hashPassword(senha, salt);
      lista.push({ id: crypto.randomUUID(), nome, email, salt, senhaHash });
      salvar(lista);
      cadastro.reset();
      mostrarAba("login");
      login.elements.email.value = email;
      mensagem("login", "Conta de demonstração criada. Entre para continuar.", "sucesso");
      login.elements.senha.focus();
    } catch (error) {
      mensagem("cadastro", error instanceof DOMException && error.name === "QuotaExceededError"
        ? "O navegador está sem espaço para salvar esta conta." : "Não foi possível criar a conta neste navegador.");
      console.error(error);
    } finally { button.disabled = false; }
  });

  login.addEventListener("submit", async event => {
    event.preventDefault();
    limparMensagens();
    if (!login.reportValidity()) return;
    const email = emailNormalizado(login.elements.email.value);
    const senha = login.elements.senha.value;
    const button = login.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const lista = usuarios();
      const user = lista.find(item => emailNormalizado(item.email ?? "") === email);
      const valid = user && (user.salt && user.senhaHash
        ? (await hashPassword(senha, user.salt)) === user.senhaHash
        : user.senha === senha); // Compatibilidade com cadastros antigos.
      if (!valid) {
        mensagem("login", "E-mail ou senha incorretos.");
        return;
      }
      if (user.senha && !user.senhaHash) {
        user.salt = crypto.randomUUID();
        user.senhaHash = await hashPassword(senha, user.salt);
        delete user.senha;
        salvar(lista);
      }
      const sessao = JSON.stringify({ id: user.id ?? email, nome: user.nome, email, conectadoEm: Date.now() });
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      (document.querySelector("#lembrar-login").checked ? localStorage : sessionStorage)
        .setItem(SESSION_KEY, sessao);
      mensagem("login", `Bem-vindo(a), ${user.nome}! Redirecionando...`, "sucesso");
      window.setTimeout(() => { window.location.href = "index.html"; }, 700);
    } catch (error) {
      mensagem("login", "Não foi possível acessar os dados neste navegador.");
      console.error(error);
    } finally {
      if (!mensagens.login.classList.contains("sucesso")) button.disabled = false;
    }
  });

  mostrarAba(new URLSearchParams(location.search).get("tab") === "cadastro" ? "cadastro" : "login");
});
