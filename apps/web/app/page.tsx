"use client";

import { useEffect, useState } from "react";

const modules = [
  { title: "Cours", description: "Retrouve tes cours et tes sessions.", icon: "▤" },
  { title: "Agenda", description: "Garde un œil sur tes échéances.", icon: "▦" },
  { title: "Documents", description: "Tous tes documents au même endroit.", icon: "▧" },
  { title: "Révisions", description: "Apprends à ton rythme, sans perdre le fil.", icon: "✳" },
];

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const saved = window.localStorage.getItem("studenthub-dark-mode");
    const shouldBeDark = saved === null ? media.matches : saved === "true";
    setDarkMode(shouldBeDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = darkMode ? "dark" : "light";
    root.style.colorScheme = darkMode ? "dark" : "light";
    window.localStorage.setItem("studenthub-dark-mode", String(darkMode));
  }, [darkMode]);

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="StudentHub, accueil">
          <span className="brand-mark">S</span>
          <span>student<span className="brand-light">hub</span></span>
        </a>
        <p className="nav-label">ESPACE ÉTUDIANT</p>
        <nav aria-label="Navigation principale">
          <a className="nav-item active" href="#"><span>⌂</span> Vue d’ensemble</a>
          <a className="nav-item" href="#"><span>▤</span> Mes cours</a>
          <a className="nav-item" href="#"><span>▦</span> Agenda</a>
          <a className="nav-item" href="#"><span>▧</span> Documents</a>
          <a className="nav-item" href="#"><span>✳</span> Révisions</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="settings-wrapper">
            <button
              type="button"
              className="settings-button"
              aria-label="Ouvrir les paramètres"
              onClick={() => setSettingsOpen((current) => !current)}
              title="Paramètres"
            >
              <span aria-hidden="true">⚙</span>
            </button>

            {settingsOpen && (
              <div className="settings-panel" role="dialog" aria-label="Paramètres de l'application">
                <div className="settings-header">
                  <span>Paramètres</span>
                </div>
                <label className="settings-row">
                  <span>Mode sombre</span>
                  <button
                    type="button"
                    className={`toggle ${darkMode ? "is-on" : ""}`}
                    onClick={() => setDarkMode((current) => !current)}
                    aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
                  >
                    <span className="toggle-knob" />
                  </button>
                </label>
              </div>
            )}
          </div>

          <div className="profile">
            <span className="avatar">É</span>
            <span><strong>Mon espace</strong><small>Étudiant</small></span>
            <span className="dots">···</span>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <span className="breadcrumb">Espace étudiant <span>/</span> Vue d’ensemble</span>
        </header>
        <div className="content">
          <div className="welcome">
            <div>
              <p className="eyebrow">TON ESPACE, À TON RYTHME</p>
              <h1>Un pas à la fois.</h1>
              <p className="subtitle">Tout ce qu’il te faut pour avancer dans tes études, au même endroit.</p>
            </div>
          </div>

          <div className="section-heading">
            <div><p className="eyebrow">POUR BIEN COMMENCER</p><h2>Ton espace d’études</h2></div>
            <button className="text-button">Personnaliser <span>↗</span></button>
          </div>
          <div className="module-grid">
            {modules.map((module, index) => (
              <a className={`module-card card-${index + 1}`} href="#" key={module.title}>
                <span className="module-icon">{module.icon}</span>
                <span className="card-arrow">↗</span>
                <strong>{module.title}</strong>
                <span className="module-description">{module.description}</span>
              </a>
            ))}
          </div>

          <section className="quiet-card">
            <div className="quiet-icon">✦</div>
            <div>
              <p className="eyebrow">UN ESPACE QUI GRANDIT AVEC TOI</p>
              <h2>Commence simplement.</h2>
              <p>Ajoute un cours ou une date importante quand tu seras prêt·e. Le reste peut attendre.</p>
            </div>
            <button className="primary-button">Ajouter un cours <span>＋</span></button>
          </section>
        </div>
      </section>
    </main>
  );
}
