import type { ProjectState } from "@/types/project";

const STORAGE_KEY = "framewright_project_v1";

export function saveProject(state: ProjectState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save project to localStorage:", error);
  }
}

export function loadProject(): ProjectState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    const parsed = JSON.parse(serialized);
    return parsed;
  } catch (error) {
    console.error("Failed to load project from localStorage:", error);
    return null;
  }
}

export function clearProject(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear project from localStorage:", error);
  }
}
