"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AppSidebar({ active }: { active: "home" | "courses" }) {
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("studenthub-dark-mode");
    const dark = saved === null
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : saved === "true";
    setDarkMode(dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    window.localStorage.setItem("studenthub-dark-mode", String(dark));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    window.localStorage.setItem("studenthub-dark-mode", String(next));
  };

  return (
    <aside className="sidebar">
      <Link className="brand" href="/" aria-label="StudentHub, accueil">
        <span className="brand-mark">S</span>
        <span>student<span className="brand-light">hub</span></span>
      </Link>
      <p className="nav-label">ESPACE ÉTUDIANT</p>
      <nav aria-label="Navigation principale">
        <Link className={`nav-item ${active === "home" ? "active" : ""}`} href="/" aria-current={active === "home" ? "page" : undefined}><span>⌂</span> Vue d’ensemble</Link>
        <Link className={`nav-item ${active === "courses" ? "active" : ""}`} href="/courses" aria-current={active === "courses" ? "page" : undefined}><span>▤</span> Mes cours</Link>
        <a className="nav-item" href="#"><span>▦</span> Agenda</a>
        <a className="nav-item" href="#"><span>▧</span> Documents</a>
        <a className="nav-item" href="#"><span>✳</span> Révisions</a>
      </nav>
      <div className="sidebar-bottom">
        <div className="profile">
          <span className="avatar">É</span>
          <span><strong>Mon espace</strong><small>Étudiant</small></span>
          <div className="profile-menu-wrapper">
            <button
              type="button"
              className="dots"
              aria-label="Ouvrir les paramètres"
              aria-expanded={settingsOpen}
              aria-haspopup="dialog"
              onClick={() => setSettingsOpen((open) => !open)}
              title="Paramètres"
            >
              <span aria-hidden="true">···</span>
            </button>
            {settingsOpen && (
              <div className="settings-panel" role="dialog" aria-label="Paramètres de l'application">
                <div className="settings-header">Paramètres</div>
                <label className="settings-row">
                  <span>Mode sombre</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={darkMode}
                    className={`toggle ${darkMode ? "is-on" : ""}`}
                    onClick={toggleDarkMode}
                    aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
                  >
                    <span className="toggle-knob" />
                  </button>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
