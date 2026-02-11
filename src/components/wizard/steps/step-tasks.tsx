"use client";

import { useProject } from "@/contexts/project-context";
import { MAX_TASKS } from "@/lib/constants";
import type { Task, Feature } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useMemo } from "react";

function formatTaskNumber(n: number): string {
  return `task-${String(n).padStart(3, "0")}`;
}

export function StepTasks() {
  const { state, dispatch } = useProject();
  const tasks = state.tasks;
  const features = state.features;

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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
