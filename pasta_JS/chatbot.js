(() => {
    "use strict";

    function iniciarChatbot() {
        if (document.querySelector("#gps-chatbot")) return;

        const raiz = document.createElement("div");
        raiz.id = "gps-chatbot";
        raiz.className = "gps-chatbot";

        raiz.innerHTML = `
            <button
                class="gps-chatbot-toggle"
                type="button"
                aria-label="Abrir assistente de Brasília"
                aria-expanded="false"
                aria-controls="gps-chatbot-panel"
            >
                <span aria-hidden="true">✦</span>
                <span>Descubra Brasília</span>
            </button>

            <section
                id="gps-chatbot-panel"
                class="gps-chatbot-panel"
                aria-label="Assistente de Brasília"
                hidden
            >
                <header class="gps-chatbot-header">
                    <div>
                        <strong>Seu GPS pela cidade</strong>
                        <span>Encontre um lugar para conhecer</span>
                    </div>

                    <button
                        class="gps-chatbot-close"
                        type="button"
                        aria-label="Fechar assistente"
                    >×</button>
                </header>

                <div
                    class="gps-chatbot-messages"
                    role="log"
                    aria-live="polite"
                ></div>

                <div
                    class="gps-chatbot-actions"
                    aria-label="Escolha uma categoria"
                ></div>
            </section>
        `;

        document.body.appendChild(raiz);

        const abrirBotao = raiz.querySelector(".gps-chatbot-toggle");
        const fecharBotao = raiz.querySelector(".gps-chatbot-close");
        const painel = raiz.querySelector(".gps-chatbot-panel");
        const mensagens = raiz.querySelector(".gps-chatbot-messages");
        const acoes = raiz.querySelector(".gps-chatbot-actions");

        // Usa os lugares cadastrados em explorar-modal.js.
        const dados =
            typeof exploreData !== "undefined"
                ? exploreData
                : {};

        const categorias = [
            ...document.querySelectorAll(
                ".explore-category[data-category]"
            )
        ].map((botao) => ({
            id: botao.dataset.category,
            nome:
                botao.querySelector("span")?.textContent.trim() ||
                botao.textContent.trim(),
            botao
        }));

        function rolarAteOFim() {
            mensagens.scrollTop = mensagens.scrollHeight;
        }

        function criarMensagem(texto, autor = "bot") {
            const mensagem = document.createElement("p");

            mensagem.className =
                `gps-chatbot-message gps-chatbot-message--${autor}`;

            mensagem.textContent = texto;
            mensagens.appendChild(mensagem);

            rolarAteOFim();
        }

        function fecharChat() {
            painel.hidden = true;

            abrirBotao.setAttribute("aria-expanded", "false");
            abrirBotao.setAttribute(
                "aria-label",
                "Abrir assistente de Brasília"
            );

            abrirBotao.focus();
        }

        function abrirChat() {
            painel.hidden = false;

            abrirBotao.setAttribute("aria-expanded", "true");
            abrirBotao.setAttribute(
                "aria-label",
                "Fechar assistente de Brasília"
            );

            fecharBotao.focus();

            if (!mensagens.children.length) {
                criarMensagem(
                    "Oi! O que você gostaria de conhecer em Brasília? " +
                    "Escolha uma categoria abaixo."
                );
            }
        }

        function abrirCategoria(categoria) {
            fecharChat();
            categoria.botao.click();
        }

        function mostrarLugares(categoria) {
            criarMensagem(categoria.nome, "usuario");

            const lugares = dados[categoria.id]?.places;

            if (!Array.isArray(lugares) || lugares.length === 0) {
                criarMensagem(
                    "Vamos ver os lugares dessa categoria?"
                );

                abrirCategoria(categoria);
                return;
            }

            criarMensagem(
                `Aqui vão algumas sugestões de ${categoria.nome.toLowerCase()}:`
            );

            const lista = document.createElement("div");
            lista.className = "gps-chatbot-places";

            lugares.slice(0, 3).forEach((lugar) => {
                const item = document.createElement("article");
                item.className = "gps-chatbot-place";

                const titulo = document.createElement("strong");
                titulo.textContent = lugar.name;
                item.appendChild(titulo);

                const detalhes = document.createElement("span");

                detalhes.textContent = [
                    lugar.region,
                    lugar.description
                ].filter(Boolean).join(" · ");

                item.appendChild(detalhes);

                if (
                    typeof lugar.route === "string" &&
                    lugar.route.startsWith("https://")
                ) {
                    const rota = document.createElement("a");

                    rota.href = lugar.route;
                    rota.target = "_blank";
                    rota.rel = "noopener noreferrer";
                    rota.textContent = "Ver rota ↗";

                    item.appendChild(rota);
                }

                lista.appendChild(item);
            });

            mensagens.appendChild(lista);

            const verMais = document.createElement("button");
            verMais.className = "gps-chatbot-more";
            verMais.type = "button";
            verMais.textContent =
                `Ver todos em ${categoria.nome} →`;

            verMais.addEventListener("click", () => {
                abrirCategoria(categoria);
            });

            mensagens.appendChild(verMais);
            rolarAteOFim();
        }

        if (categorias.length) {
            categorias.forEach((categoria) => {
                const botao = document.createElement("button");

                botao.type = "button";
                botao.textContent = categoria.nome;

                botao.addEventListener("click", () => {
                    mostrarLugares(categoria);
                });

                acoes.appendChild(botao);
            });
        } else {
            criarMensagem(
                "As categorias ainda não estão disponíveis nesta página."
            );
        }

        abrirBotao.addEventListener("click", () => {
            if (painel.hidden) {
                abrirChat();
            } else {
                fecharChat();
            }
        });

        fecharBotao.addEventListener("click", fecharChat);

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && !painel.hidden) {
                fecharChat();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarChatbot,
            { once: true }
        );
    } else {
        iniciarChatbot();
    }
})();