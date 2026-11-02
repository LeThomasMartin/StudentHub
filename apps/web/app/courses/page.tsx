import { AppSidebar } from "../AppSidebar";
import { CourseManager } from "@/features/courses/CourseManager";
import "./courses.css";

export const metadata = {
  title: "Mes cours | StudentHub",
};

export default function CoursesPage() {
  return (
    <main className="shell">
      <AppSidebar active="courses" />

      <section className="main-panel">
        <header className="topbar">
          <span className="breadcrumb">
            Espace étudiant <span>/</span> Mes cours
          </span>
        </header>
        <CourseManager />
      </section>
    </main>
  );
}
