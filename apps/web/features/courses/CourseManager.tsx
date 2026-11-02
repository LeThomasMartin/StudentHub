"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { CourseSummary, SemesterCourseGroup } from "./course-types";

interface CourseFormState {
  name: string;
  code: string;
  description: string;
  semesterId: string;
}

interface SemesterFormState {
  name: string;
  startDate: string;
  endDate: string;
}

interface CourseApiResponse {
  semesters?: SemesterCourseGroup[];
  error?: string;
}

const emptyForm: CourseFormState = {
  name: "",
  code: "",
  description: "",
  semesterId: "",
};

const emptySemesterForm: SemesterFormState = {
  name: "",
  startDate: "",
  endDate: "",
};

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-CA", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

async function getErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return "Une erreur est survenue. Réessaie.";
}

export function CourseManager() {
  const [semesters, setSemesters] = useState<SemesterCourseGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSemester, setIsSavingSemester] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [semesterFormError, setSemesterFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSemesterFormOpen, setIsSemesterFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseSummary | null>(null);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [semesterForm, setSemesterForm] = useState<SemesterFormState>(emptySemesterForm);

  const loadCourses = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setPageError(null);

    try {
      const response = await fetch("/api/courses", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }
      const payload = (await response.json()) as CourseApiResponse;
      setSemesters(payload.semesters ?? []);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les cours. Réessaie dans un instant.",
      );
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  function openCreateForm() {
    setEditingCourse(null);
    setForm({ ...emptyForm, semesterId: semesters[0]?.id ?? "" });
    setFormError(null);
    setIsFormOpen(true);
  }

  function openSemesterForm() {
    setSemesterForm({ ...emptySemesterForm });
    setSemesterFormError(null);
    setIsSemesterFormOpen(true);
  }

  function openEditForm(course: CourseSummary, semesterId: string) {
    setEditingCourse(course);
    setForm({
      name: course.name,
      code: course.code ?? "",
      description: course.description ?? "",
      semesterId,
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;
    setIsFormOpen(false);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const response = await fetch(
        editingCourse ? `/api/courses/${editingCourse.id}` : "/api/courses",
        {
          method: editingCourse ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setIsFormOpen(false);
      await loadCourses(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Impossible d’enregistrer le cours.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSemesterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingSemester(true);
    setSemesterFormError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(semesterForm),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setIsSemesterFormOpen(false);
      setSuccessMessage("La session a été créée.");
      await loadCourses(false);
    } catch (error) {
      setSemesterFormError(
        error instanceof Error ? error.message : "Impossible de créer la session.",
      );
    } finally {
      setIsSavingSemester(false);
    }
  }

  async function handleDelete(course: CourseSummary) {
    const confirmed = window.confirm(
      `Supprimer « ${course.name} » ? Cette action est définitive.`,
    );
    if (!confirmed) return;

    setDeletingCourseId(course.id);
    setPageError(null);
    try {
      const response = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }
      await loadCourses(false);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Impossible de supprimer ce cours.",
      );
    } finally {
      setDeletingCourseId(null);
    }
  }

  const courseCount = semesters.reduce(
    (total, semester) => total + semester.courses.length,
    0,
  );

  return (
    <div className="courses-content">
      <div className="courses-intro">
        <div>
          <p className="eyebrow">TON PARCOURS ACADÉMIQUE</p>
          <h1>Mes cours</h1>
          <p className="courses-subtitle">
            Retrouve tes cours, organisés par session.
          </p>
        </div>
        <div className="courses-header-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={openSemesterForm}
          >
            Ajouter une session <span aria-hidden="true">＋</span>
          </button>
          <button
            className="primary-button courses-add-button"
            type="button"
            onClick={openCreateForm}
            disabled={semesters.length === 0}
          >
            Ajouter un cours <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>

      <div className="courses-summary" aria-live="polite">
        <span>{courseCount}</span> cours au total
        <span className="summary-divider">·</span>
        {semesters.length} {semesters.length === 1 ? "session" : "sessions"}
      </div>

      {successMessage && (
        <div className="courses-success" role="status">{successMessage}</div>
      )}

      {pageError && (
        <div className="courses-alert" role="alert">
          <span>{pageError}</span>
          <button type="button" className="text-button" onClick={() => void loadCourses()}>
            Réessayer
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="courses-state" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          Chargement des cours…
        </div>
      ) : semesters.length === 0 ? (
        <section className="courses-empty">
          <span className="empty-symbol" aria-hidden="true">▦</span>
          <h2>Aucune session disponible</h2>
          <p>Une session doit être créée avant de pouvoir y associer des cours.</p>
          <button type="button" className="primary-button" onClick={openSemesterForm}>
            Créer une session <span aria-hidden="true">＋</span>
          </button>
        </section>
      ) : courseCount === 0 ? (
        <section className="courses-empty">
          <span className="empty-symbol" aria-hidden="true">▤</span>
          <h2>Ton espace cours est prêt</h2>
          <p>Ajoute ton premier cours pour commencer à organiser tes études.</p>
          <button type="button" className="primary-button" onClick={openCreateForm}>
            Ajouter un cours <span aria-hidden="true">＋</span>
          </button>
        </section>
      ) : (
        <div className="semester-list">
          {semesters.map((semester) => (
            <section className="semester-card" key={semester.id}>
              <header className="semester-heading">
                <div>
                  <p className="eyebrow">SESSION</p>
                  <h2>{semester.name}</h2>
                  <p className="semester-dates">
                    {formatDate(semester.startDate)} <span>—</span>{" "}
                    {formatDate(semester.endDate)}
                  </p>
                </div>
                <span className="semester-count">
                  {semester.courses.length} cours
                </span>
              </header>

              {semester.courses.length === 0 ? (
                <p className="semester-empty">Aucun cours dans cette session pour le moment.</p>
              ) : (
                <ul className="course-list">
                  {semester.courses.map((course) => (
                    <li className="course-row" key={course.id}>
                      <span className="course-mark" aria-hidden="true">▤</span>
                      <div className="course-info">
                        <h3>{course.name}</h3>
                        {course.code && <span className="course-code">{course.code}</span>}
                        {course.description && (
                          <p className="course-description">{course.description}</p>
                        )}
                      </div>
                      <div className="course-actions">
                        <button
                          type="button"
                          className="course-action"
                          onClick={() => openEditForm(course, semester.id)}
                          aria-label={`Modifier ${course.name}`}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="course-action course-delete"
                          onClick={() => void handleDelete(course)}
                          disabled={deletingCourseId === course.id}
                          aria-label={`Supprimer ${course.name}`}
                        >
                          {deletingCourseId === course.id ? "Suppression…" : "Supprimer"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div
          className="course-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="course-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
          >
            <header className="course-modal-header">
              <div>
                <p className="eyebrow">{editingCourse ? "MODIFIER" : "NOUVEAU COURS"}</p>
                <h2 id="course-modal-title">
                  {editingCourse ? "Modifier le cours" : "Ajouter un cours"}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                aria-label="Fermer"
                disabled={isSaving}
              >
                ×
              </button>
            </header>

            <form className="course-form" onSubmit={handleSubmit}>
              <label>
                Nom du cours <span aria-hidden="true">*</span>
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Ex. Anatomie fonctionnelle"
                />
              </label>
              <label>
                Session <span aria-hidden="true">*</span>
                <select
                  required
                  value={form.semesterId}
                  onChange={(event) => setForm({ ...form, semesterId: event.target.value })}
                >
                  <option value="" disabled>Sélectionner une session</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>{semester.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Code du cours <span className="field-optional">Facultatif</span>
                <input
                  maxLength={30}
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  placeholder="Ex. PHT-1001"
                />
              </label>
              <label>
                Description <span className="field-optional">Facultative</span>
                <textarea
                  maxLength={2_000}
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Quelques détails sur ce cours…"
                />
              </label>

              {formError && <p className="form-error" role="alert">{formError}</p>}

              <div className="course-form-actions">
                <button type="button" className="secondary-button" onClick={closeForm} disabled={isSaving}>
                  Annuler
                </button>
                <button type="submit" className="primary-button" disabled={isSaving}>
                  {isSaving ? "Enregistrement…" : editingCourse ? "Enregistrer" : "Créer le cours"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isSemesterFormOpen && (
        <div
          className="course-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSavingSemester) {
              setIsSemesterFormOpen(false);
            }
          }}
        >
          <section
            className="course-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="semester-modal-title"
          >
            <header className="course-modal-header">
              <div>
                <p className="eyebrow">NOUVELLE SESSION</p>
                <h2 id="semester-modal-title">Créer une session</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsSemesterFormOpen(false)}
                aria-label="Fermer"
                disabled={isSavingSemester}
              >
                ×
              </button>
            </header>

            <form className="course-form" onSubmit={handleSemesterSubmit}>
              <label>
                Nom de la session <span aria-hidden="true">*</span>
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={semesterForm.name}
                  onChange={(event) =>
                    setSemesterForm({ ...semesterForm, name: event.target.value })
                  }
                  placeholder="Ex. Automne 2026"
                />
              </label>
              <div className="semester-date-fields">
                <label>
                  Date de début <span aria-hidden="true">*</span>
                  <input
                    type="date"
                    required
                    value={semesterForm.startDate}
                    onChange={(event) =>
                      setSemesterForm({ ...semesterForm, startDate: event.target.value })
                    }
                  />
                </label>
                <label>
                  Date de fin <span aria-hidden="true">*</span>
                  <input
                    type="date"
                    required
                    min={semesterForm.startDate || undefined}
                    value={semesterForm.endDate}
                    onChange={(event) =>
                      setSemesterForm({ ...semesterForm, endDate: event.target.value })
                    }
                  />
                </label>
              </div>

              {semesterFormError && (
                <p className="form-error" role="alert">{semesterFormError}</p>
              )}

              <div className="course-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsSemesterFormOpen(false)}
                  disabled={isSavingSemester}
                >
                  Annuler
                </button>
                <button type="submit" className="primary-button" disabled={isSavingSemester}>
                  {isSavingSemester ? "Création…" : "Créer la session"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
