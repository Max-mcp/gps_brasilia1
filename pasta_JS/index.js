"use strict";



    

    document.addEventListener("DOMContentLoaded", () => {

/* ===================================
       MENU DO CELULAR
    =================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    function fecharMenu() {
        if (!menuToggle || !mainNav) return;

        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menu");
        menuToggle.textContent = "☰";
    }

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const aberto = mainNav.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(aberto));
            menuToggle.setAttribute(
                "aria-label",
                aberto ? "Fechar menu" : "Abrir menu"
            );
            menuToggle.textContent = aberto ? "×" : "☰";
        });

        mainNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", fecharMenu);
        });

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") fecharMenu();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 850) fecharMenu();
        });
    }


    /* ===================================
       MENU DO PERFIL
    =================================== */

    const profileMenu =
        document.querySelector(".profile-menu");

    const profileTrigger =
        document.querySelector("#profile-trigger");

    const profileDropdown =
        document.querySelector("#profile-dropdown");

    function abrirMenuPerfil() {

        if (!profileTrigger || !profileDropdown) {
            return;
        }

        profileDropdown.hidden = false;

        profileTrigger.setAttribute(
            "aria-expanded",
            "true"
        );

    }

    function fecharMenuPerfil() {

        if (!profileTrigger || !profileDropdown) {
            return;
        }

        profileDropdown.hidden = true;

        profileTrigger.setAttribute(
            "aria-expanded",
            "false"
        );

    }

    function alternarMenuPerfil() {

        if (!profileDropdown) {
            return;
        }

        if (profileDropdown.hidden) {
            abrirMenuPerfil();
        } else {
            fecharMenuPerfil();
        }

    }

    if (
        profileMenu &&
        profileTrigger &&
        profileDropdown
    ) {

        profileTrigger.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();
                evento.stopPropagation();

                alternarMenuPerfil();

            }
        );

        profileDropdown.addEventListener(
            "click",
            (evento) => {

                evento.stopPropagation();

            }
        );

        document.addEventListener(
            "click",
            (evento) => {

                if (!profileMenu.contains(evento.target)) {
                    fecharMenuPerfil();
                }

            }
        );

        document.addEventListener(
            "keydown",
            (evento) => {

                if (evento.key === "Escape") {
                    fecharMenuPerfil();
                }

            }
        );

    }


    /* ===================================
       ANIMAÇÕES DAS SEÇÕES
    =================================== */

    const elementosReveal =
        document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.1
                }
            );

        elementosReveal.forEach((elemento) => {
            revealObserver.observe(elemento);
        });

    } else {

        elementosReveal.forEach((elemento) => {
            elemento.classList.add("visible");
        });

    }


    /* ===================================
       LINK ATIVO DA NAVEGAÇÃO
    =================================== */

    const secoes =
        document.querySelectorAll("main section[id]");

    const linksInternos =
        document.querySelectorAll(
            '.main-nav > a[href^="#"]'
        );

    if ("IntersectionObserver" in window) {

        const navObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        linksInternos.forEach((link) => {

                            const corresponde =
                                link.getAttribute("href") ===
                                `#${entry.target.id}`;

                            link.classList.toggle(
                                "active",
                                corresponde
                            );

                        });

                    });

                },
                {
                    rootMargin: "-35% 0px -55%"
                }
            );

        secoes.forEach((secao) => {
            navObserver.observe(secao);
        });

    }

});