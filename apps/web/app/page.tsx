"use client";

import { AppSidebar } from "./AppSidebar";

const modules = [
  { title: "Cours", description: "Retrouve tes cours et tes sessions.", icon: "▤", href: "/courses" },
  { title: "Agenda", description: "Garde un œil sur tes échéances.", icon: "▦", href: "#" },
  { title: "Documents", description: "Tous tes documents au même endroit.", icon: "▧", href: "#" },
  { title: "Révisions", description: "Réviser les notions importantes.", icon: "✳", href: "#" },
];

export default function HomePage() {
  return (
    <main className="shell">
      <AppSidebar active="home" />

      <section className="main-panel">
        <header className="topbar">
          <span className="breadcrumb">Espace étudiant <span>/</span> Vue d’ensemble</span>
        </header>
        <div className="content">
          <div className="welcome">
            <div>
              <p className="eyebrow">ACCUEIL</p>
              <h1>Vue d’ensemble</h1>
              <p className="subtitle">Cours, agenda, documents et révisions.</p>
            </div>
          </div>

          <div className="section-heading">
            <div><p className="eyebrow">POUR BIEN COMMENCER</p><h2>Ton espace d’études</h2></div>
          </div>
          <div className="module-grid">
            {modules.map((module, index) => (
              <a className={`module-card card-${index + 1}`} href={module.href ?? "#"} key={module.title}>
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
              <p className="eyebrow">COURS</p>
              <h2>Aucun cours pour le moment</h2>
              <p>Ajoute un cours pour le retrouver ici.</p>
            </div>
            <a className="primary-button" href="/courses">Ajouter un cours <span>＋</span></a>
          </section>
        </div>
      </section>
    </main>
  );
}
