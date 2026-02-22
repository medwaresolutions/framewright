"use client";

import { useProject } from "@/contexts/project-context";
import { MAX_TASKS } from "@/lib/constants";
import type { Task, Feature, TaskStatus } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical, AlertTriangle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useEffect } from "react";

function formatTaskNumber(n: number): string {
  return `task-${String(n).padStart(3, "0")}`;
}

function generateSkeletonDod(state: { identity: { techStack: { framework: string; database: string; auth: string; deployment: string; styling: string; componentLibrary: string } } }): string {
  const { framework, database, auth, deployment, styling } = state.identity.techStack;
  const items: string[] = [
    "Project repository created and cloned locally",
    framework ? `${framework} project initialised with default config` : "Project initialised with chosen framework",
    styling ? `${styling} configured and working` : "Styling framework configured",
    "Basic folder structure matches architecture layers from PROJECT.md",
    database ? `${database} connection established and verified` : null,
    auth ? `${auth} auth scaffolded (login/signup pages exist, even if non-functional)` : null,
    deployment ? `App deployed to ${deployment} (even if just a hello-world page)` : "App deployed to hosting platform",
    "All team members can clone, install, and run locally",
    "README updated with local development instructions",
  ].filter((item): item is string => item !== null);
  return items.join("\n");
}

export function StepTasks() {
  const { state, dispatch } = useProject();
  const tasks = state.tasks;
  const features = state.features;

  // Auto-generate task-000 (Skeleton Deployment) if it doesn't exist
  useEffect(() => {
    const hasTask000 = tasks.some((t) => t.taskNumber === 0);
    if (!hasTask000 && features.length > 0) {
      const skeletonTask: Task = {
        id: crypto.randomUUID(),
        taskNumber: 0,
        name: "Skeleton Deployment",
        featureIds: features.map((f) => f.id),
        definitionOfDone: generateSkeletonDod(state),
        fileBoundaries: "package.json, README.md, .env.example, src/app/layout.tsx, src/app/page.tsx",
        sortOrder: -1,
      };
      dispatch({ type: "ADD_TASK", payload: skeletonTask });
    }
  }, [features.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Validation: tasks with no features assigned
  const orphanedTasks = useMemo(
    () => tasks.filter((t) => t.featureIds.length === 0),
    [tasks]
  );

  const addTask = () => {
    const nextNumber =
      tasks.length > 0
        ? Math.max(...tasks.map((t) => t.taskNumber)) + 1
        : 1;

    const newTask: Task = {
      id: crypto.randomUUID(),
      taskNumber: nextNumber,
      name: "",
      featureIds: [],
      definitionOfDone: "",
      fileBoundaries: "",
      outOfScope: "",
      status: "not-started",
      sortOrder: tasks.length,
    };
    dispatch({ type: "ADD_TASK", payload: newTask });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: "UPDATE_TASK", payload: { id, updates } });
  };

  const removeTask = (id: string) => {
    dispatch({ type: "REMOVE_TASK", payload: id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex).map(
      (task, index) => ({ ...task, sortOrder: index })
    );
    dispatch({ type: "REORDER_TASKS", payload: reordered });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="mt-1 text-muted-foreground">
            Break features into focused, AI-ready tasks. Each task should be
            small enough for a single coding session.
          </p>
        </div>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      {/* Warnings */}
      {orphanedTasks.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
          <span>
            {orphanedTasks.length} task{orphanedTasks.length > 1 ? "s" : ""}{" "}
            not linked to any feature:{" "}
            {orphanedTasks
              .map((t) => formatTaskNumber(t.taskNumber))
              .join(", ")}
          </span>
        </div>
      )}

      {features.length === 0 && (
        <div className="flex items-start gap-2 rounded-md border border-blue-500/50 bg-blue-500/10 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <span>
            No features defined yet. Go back to Step 6 to add features before
            creating tasks.
          </span>
        </div>
      )}

      {/* Add Task button */}
      <Button
        onClick={addTask}
        disabled={tasks.length >= MAX_TASKS}
        className="gap-2"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </Button>

      {/* Task list with drag-and-drop */}
      {tasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  features={features}
                  onUpdate={updateTask}
                  onRemove={removeTask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="mb-4">
            No tasks yet. Create tasks to break your features into actionable
            work items.
          </p>
          <Button onClick={addTask} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Task
          </Button>
        </div>
      )}
    </div>
  );
}

function SortableTaskCard({
  task,
  features,
  onUpdate,
  onRemove,
}: {
  task: Task;
  features: Feature[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleFeature = (featureId: string) => {
    const current = task.featureIds;
    const updated = current.includes(featureId)
      ? current.filter((id) => id !== featureId)
      : [...current, featureId];
    onUpdate(task.id, { featureIds: updated });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 space-y-4">
              {/* Task number + name row */}
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  {formatTaskNumber(task.taskNumber)}
                </Badge>
                <Input
                  placeholder="Task name"
                  value={task.name}
                  onChange={(e) =>
                    onUpdate(task.id, { name: e.target.value })
                  }
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(task.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Associated Features */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Associated Features
                </Label>
                {features.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature) => (
                      <label
                        key={feature.id}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs cursor-pointer transition-colors",
                          task.featureIds.includes(feature.id)
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          checked={task.featureIds.includes(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="h-3 w-3"
                        />
                        {feature.name || "Unnamed feature"}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No features defined yet.
                  </p>
                )}
              </div>

              {/* Definition of Done */}
              <div className="space-y-1">
                <Label htmlFor={`dod-${task.id}`} className="text-xs text-muted-foreground">
                  Definition of Done
                </Label>
                <Textarea
                  id={`dod-${task.id}`}
                  placeholder="What needs to be true for this task to be complete? e.g., 'User can log in with email/password, session persists across page refresh, invalid credentials show error message'"
                  value={task.definitionOfDone}
                  onChange={(e) =>
                    onUpdate(task.id, { definitionOfDone: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {/* File Boundaries */}
              <div className="space-y-1">
                <Label htmlFor={`files-${task.id}`} className="text-xs text-muted-foreground">
                  File Boundaries
                </Label>
                <Textarea
                  id={`files-${task.id}`}
                  placeholder="Which files should this task touch? e.g., 'src/app/login/page.tsx, src/lib/auth.ts, src/components/login-form.tsx'"
                  value={task.fileBoundaries}
                  onChange={(e) =>
                    onUpdate(task.id, { fileBoundaries: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {/* Out of Scope */}
              <div className="space-y-1">
                <Label htmlFor={`oos-${task.id}`} className="text-xs text-muted-foreground">
                  Out of Scope
                </Label>
                <Textarea
                  id={`oos-${task.id}`}
                  placeholder="What must NOT be touched? e.g., 'Do not modify the auth layer, do not change database schema, do not refactor adjacent components'"
                  value={task.outOfScope ?? ""}
                  onChange={(e) =>
                    onUpdate(task.id, { outOfScope: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select
                  value={task.status ?? "not-started"}
                  onValueChange={(value) =>
                    onUpdate(task.id, { status: value as TaskStatus })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">○ Not Started</SelectItem>
                    <SelectItem value="in-progress">→ In Progress</SelectItem>
                    <SelectItem value="done">✓ Done</SelectItem>
                    <SelectItem value="blocked">✗ Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
