"use client";

import { useProject } from "@/contexts/project-context";
import { useChat } from "@/contexts/chat-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { MAX_FEATURES } from "@/lib/constants";
import type { Feature } from "@/types/project";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableFeatureCardProps {
  feature: Feature;
  onUpdate: (updates: Partial<Feature>) => void;
  onRemove: () => void;
  availableTables: { name: string }[];
}

function SortableFeatureCard({
  feature,
  onUpdate,
  onRemove,
  availableTables,
}: SortableFeatureCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });
  const { setFocusedField } = useChat();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    onUpdate({ name, slug });
  };

  // Acceptance criteria handlers
  const addAcceptanceCriterion = () => {
    onUpdate({ acceptanceCriteria: [...(feature.acceptanceCriteria ?? []), ""] });
  };

  const updateAcceptanceCriterion = (index: number, value: string) => {
    const updated = [...(feature.acceptanceCriteria ?? [])];
    updated[index] = value;
    onUpdate({ acceptanceCriteria: updated });
  };

  const removeAcceptanceCriterion = (index: number) => {
    const updated = (feature.acceptanceCriteria ?? []).filter((_, i) => i !== index);
    onUpdate({ acceptanceCriteria: updated });
  };

  // Business rules handlers
  const addBusinessRule = () => {
    onUpdate({ businessRules: [...feature.businessRules, ""] });
  };

  const updateBusinessRule = (index: number, value: string) => {
    const updatedRules = [...feature.businessRules];
    updatedRules[index] = value;
    onUpdate({ businessRules: updatedRules });
  };

  const removeBusinessRule = (index: number) => {
    const updatedRules = feature.businessRules.filter((_, i) => i !== index);
    onUpdate({ businessRules: updatedRules });
  };

  // Related tables handlers
  const toggleTable = (tableName: string) => {
    const isSelected = feature.relatedTables.includes(tableName);
    const updatedTables = isSelected
      ? feature.relatedTables.filter((t) => t !== tableName)
      : [...feature.relatedTables, tableName];
    onUpdate({ relatedTables: updatedTables });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/20"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-start pt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Name and slug */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`feature-name-${feature.id}`}>
                  Feature Name
                </Label>
                <Input
                  id={`feature-name-${feature.id}`}
                  value={feature.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., User Authentication"
                  onFocus={() =>
                    setFocusedField({
                      fieldId: `feature.name.${feature.id}`,
                      fieldLabel: "Feature Name",
                      fieldDescription:
                        "Short name identifying a distinct capability or user workflow",
                      step: 6,
                    })
                  }
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`feature-slug-${feature.id}`}>Slug</Label>
                <Input
                  id={`feature-slug-${feature.id}`}
                  value={feature.slug}
                  readOnly
                  className="bg-muted/50 text-muted-foreground"
                  placeholder="auto-generated"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor={`feature-description-${feature.id}`}>
                Description
              </Label>
              <Textarea
                id={`feature-description-${feature.id}`}
                value={feature.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="What does this feature do? What problem does it solve?"
                rows={2}
                onFocus={() =>
                  setFocusedField({
                    fieldId: `feature.description.${feature.id}`,
                    fieldLabel: "Feature Description",
                    fieldDescription:
                      "What this feature does from the user's perspective — the problem it solves",
                    step: 6,
                  })
                }
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Acceptance Criteria</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    What does success look like from the user's perspective?
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addAcceptanceCriterion}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Criterion
                </Button>
              </div>
              <div className="space-y-2">
                {(feature.acceptanceCriteria ?? []).map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={criterion}
                      onChange={(e) =>
                        updateAcceptanceCriterion(index, e.target.value)
                      }
                      placeholder="e.g., User can log in and see their dashboard within 2 seconds"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAcceptanceCriterion(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(feature.acceptanceCriteria ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No acceptance criteria yet. Click "Add Criterion" to define what done looks like for users.
                  </p>
                )}
              </div>
            </div>

            {/* Business Rules */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Business Rules</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addBusinessRule}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>
              <div className="space-y-2">
                {feature.businessRules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) =>
                        updateBusinessRule(index, e.target.value)
                      }
                      placeholder="e.g., Passwords must be at least 8 characters"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBusinessRule(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {feature.businessRules.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No business rules yet. Click "Add Rule" to define
                    constraints or requirements.
                  </p>
                )}
              </div>
            </div>

            {/* Related Tables */}
            <div className="space-y-2">
              <Label>Related Database Tables</Label>
              {availableTables.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTables.map((table) => (
                    <div
                      key={table.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${feature.id}-table-${table.name}`}
                        checked={feature.relatedTables.includes(table.name)}
                        onCheckedChange={() => toggleTable(table.name)}
                      />
                      <label
                        htmlFor={`${feature.id}-table-${table.name}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {table.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No database tables defined yet. Define tables in the Database
                  step to link them here.
                </p>
              )}
            </div>
          </div>

          {/* Delete button */}
          <div className="flex items-start pt-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StepFeatures() {
  const { state, dispatch } = useProject();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFeature = () => {
    const newFeature: Feature = {
      id: crypto.randomUUID(),
      name: "",
      slug: "",
      description: "",
      businessRules: [""],
      acceptanceCriteria: [],
      relatedTables: [],
      sortOrder: state.features.length,
    };
    dispatch({ type: "ADD_FEATURE", payload: newFeature });
  };

  const updateFeature = (id: string, updates: Partial<Feature>) => {
    dispatch({ type: "UPDATE_FEATURE", payload: { id, updates } });
  };

  const removeFeature = (id: string) => {
    dispatch({ type: "REMOVE_FEATURE", payload: id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = state.features.findIndex((f) => f.id === active.id);
      const newIndex = state.features.findIndex((f) => f.id === over.id);

      const reorderedFeatures = arrayMove(state.features, oldIndex, newIndex);

      // Update sortOrder for all features
      const featuresWithUpdatedSort = reorderedFeatures.map((feature, idx) => ({
        ...feature,
        sortOrder: idx,
      }));

      dispatch({ type: "REORDER_FEATURES", payload: featuresWithUpdatedSort });
    }
  };

  const isMaxFeaturesReached = state.features.length >= MAX_FEATURES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
            {state.features.length > 0 && (
              <Badge variant="secondary">{state.features.length}</Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            Define the core features and functionality of your project. Each
            feature should represent a distinct capability or user workflow.
          </p>
        </div>
        <Button
          onClick={addFeature}
          disabled={isMaxFeaturesReached}
          className="ml-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {/* Empty state */}
      {state.features.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No features yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Features define what your project needs to do. Start by adding
              your first feature to outline the core functionality.
            </p>
            <Button onClick={addFeature}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Feature
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feature cards with drag-and-drop */}
      {state.features.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.features.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {state.features.map((feature) => (
                <SortableFeatureCard
                  key={feature.id}
                  feature={feature}
                  onUpdate={(updates) => updateFeature(feature.id, updates)}
                  onRemove={() => removeFeature(feature.id)}
                  availableTables={state.database.tables}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Max features warning */}
      {isMaxFeaturesReached && (
        <p className="text-sm text-muted-foreground text-center">
          You've reached the maximum of {MAX_FEATURES} features. Remove a
          feature to add more.
        </p>
      )}
    </div>
  );
}
