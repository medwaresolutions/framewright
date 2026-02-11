"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import type {
  ProjectState,
  ProjectIdentity,
  ProjectArchitecture,
  ProjectStyling,
  ProjectConventions,
  ProjectDatabase,
  Feature,
  Task,
  DeploymentGuide,
} from "@/types/project";
import { createDefaultProjectState } from "@/types/project";
import { saveProject, loadProject } from "@/lib/storage";

// Action types
type ProjectAction =
  | { type: "SET_IDENTITY"; payload: Partial<ProjectIdentity> }
  | { type: "SET_ARCHITECTURE"; payload: Partial<ProjectArchitecture> }
  | { type: "SET_STYLING"; payload: Partial<ProjectStyling> }
  | { type: "SET_CONVENTIONS"; payload: Partial<ProjectConventions> }
  | { type: "SET_DATABASE"; payload: Partial<ProjectDatabase> }
  | { type: "ADD_FEATURE"; payload: Feature }
  | { type: "UPDATE_FEATURE"; payload: { id: string; updates: Partial<Feature> } }
  | { type: "REMOVE_FEATURE"; payload: string }
  | { type: "REORDER_FEATURES"; payload: Feature[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Task> } }
  | { type: "REMOVE_TASK"; payload: string }
  | { type: "REORDER_TASKS"; payload: Task[] }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_MARKDOWN_OVERRIDE"; payload: { key: string; value: string } }
  | { type: "SET_DEPLOYMENT"; payload: Partial<DeploymentGuide> }
  | { type: "LOAD_STATE"; payload: ProjectState }
  | { type: "RESET_PROJECT" };

// Reducer
function projectReducer(
  state: ProjectState,
  action: ProjectAction
): ProjectState {
  const now = new Date().toISOString();

  switch (action.type) {
    case "SET_IDENTITY":
      return {
        ...state,
        identity: { ...state.identity, ...action.payload },
        meta: { ...state.meta, updatedAt: now },
      };

    case "SET_ARCHITECTURE":
      return {
        ...state,
        architecture: { ...state.architecture, ...action.payload },
        meta: { ...state.meta, updatedAt: now },
      };

    case "SET_STYLING":
      return {
        ...state,
        styling: { ...state.styling, ...action.payload },
        meta: { ...state.meta, updatedAt: now },
      };

    case "SET_CONVENTIONS":
      return {
        ...state,
        conventions: { ...state.conventions, ...action.payload },
        meta: { ...state.meta, updatedAt: now },
      };

    case "SET_DATABASE":
      return {
        ...state,
        database: { ...state.database, ...action.payload },
        meta: { ...state.meta, updatedAt: now },
      };

    case "ADD_FEATURE":
      return {
        ...state,
        features: [...state.features, action.payload],
        meta: { ...state.meta, updatedAt: now },
      };

    case "UPDATE_FEATURE":
      return {
        ...state,
        features: state.features.map((feature) =>
          feature.id === action.payload.id
            ? { ...feature, ...action.payload.updates }
            : feature
        ),
        meta: { ...state.meta, updatedAt: now },
      };

    case "REMOVE_FEATURE":
      return {
        ...state,
        features: state.features.filter(
          (feature) => feature.id !== action.payload
        ),
        meta: { ...state.meta, updatedAt: now },
      };

    case "REORDER_FEATURES":
      return {
        ...state,
        features: action.payload,
        meta: { ...state.meta, updatedAt: now },
      };

    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        meta: { ...state.meta, updatedAt: now },
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
        meta: { ...state.meta, updatedAt: now },
      };

    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        meta: { ...state.meta, updatedAt: now },
      };

    case "REORDER_TASKS":
      return {
        ...state,
        tasks: action.payload,
        meta: { ...state.meta, updatedAt: now },
      };

    case "SET_STEP":
      return {
        ...state,
        meta: {
          ...state.meta,
          currentStep: action.payload,
          highestStepReached: Math.max(
            state.meta.highestStepReached ?? 1,
            action.payload
          ),
          updatedAt: now,
        },
      };

    case "SET_MARKDOWN_OVERRIDE":
      return {
        ...state,
        markdownOverrides: {
          ...state.markdownOverrides,
          [action.payload.key]: action.payload.value,
        },
        meta: { ...state.meta, updatedAt: now },
      };

    case "SET_DEPLOYMENT":
      return {
        ...state,
        deployment: { ...state.deployment, ...action.payload },
        meta: { ...state.meta, updatedAt: now },
      };

    case "LOAD_STATE":
      return action.payload;

    case "RESET_PROJECT":
      return createDefaultProjectState();

    default:
      return state;
  }
}

// Context type
interface ProjectContextValue {
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetProject: () => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
);

// Provider
interface ProjectProviderProps {
  children: React.ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [state, dispatch] = useReducer(
    projectReducer,
    createDefaultProjectState()
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = loadProject();
    if (savedState) {
      dispatch({ type: "LOAD_STATE", payload: savedState });
    }
    isInitialMount.current = false;
  }, []);

  // Auto-save to localStorage (debounced 300ms)
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveProject(state);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  const goToStep = (step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  };

  const nextStep = () => {
    dispatch({ type: "SET_STEP", payload: state.meta.currentStep + 1 });
  };

  const prevStep = () => {
    dispatch({ type: "SET_STEP", payload: state.meta.currentStep - 1 });
  };

  const resetProject = () => {
    dispatch({ type: "RESET_PROJECT" });
  };

  const value: ProjectContextValue = {
    state,
    dispatch,
    goToStep,
    nextStep,
    prevStep,
    resetProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

// Hook
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
