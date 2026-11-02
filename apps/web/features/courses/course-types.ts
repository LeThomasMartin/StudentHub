export interface CourseSummary {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
}

export interface SemesterCourseGroup {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  courses: CourseSummary[];
}

export interface SemesterSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}
