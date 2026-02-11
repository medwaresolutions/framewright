"use client";

import { useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { getSmartDefaults } from "@/data/smart-defaults";
import { APP_TYPES } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StepArchitecture() {
  const { state, dispatch } = useProject();
  const { appType, layers } = state.architecture;
  const techStack = state.identity.techStack;

  // Auto-apply smart defaults on mount if layers is empty and tech stack is set
  useEffect(() => {
    if (layers.length === 0 && techStack) {
      handleApplySmartDefaults();
    }
  }, []); // Only run on mount

  const handleApplySmartDefaults = () => {
    if (!techStack) return;

    const defaults = getSmartDefaults(techStack);
    dispatch({
      type: "SET_ARCHITECTURE",
      payload: {
        appType: defaults.architecture.appType,
        layers: defaults.architecture.layers,
      },
    });
  };

  const handleAppTypeChange = (selectedAppType: string) => {
    dispatch({
      type: "SET_ARCHITECTURE",
      payload: { appType: selectedAppType },
    });
  };

  const handleLayerToggle = (layerId: string) => {
    const updatedLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
    );
    dispatch({
      type: "SET_ARCHITECTURE",
      payload: { layers: updatedLayers },
    });
  };

  const handleLayerNotesChange = (layerId: string, notes: string) => {
    const updatedLayers = layers.map((layer) =>
      layer.id === layerId ? { ...layer, notes } : layer
    );
    dispatch({
      type: "SET_ARCHITECTURE",
      payload: { layers: updatedLayers },
    });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Architecture</h2>
        <p className="text-muted-foreground">
          Define your application type and architecture layers to establish the
          structural foundation of your project.
        </p>
      </div>

      {/* Smart Defaults Button */}
      {techStack && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="space-y-1">
            <p className="text-sm font-medium">Smart Defaults Available</p>
            <p className="text-xs text-muted-foreground">
              Apply recommended architecture settings based on your tech stack
            </p>
          </div>
          <button
            onClick={handleApplySmartDefaults}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply Smart Defaults
          </button>
        </div>
      )}

      {/* App Type Selection */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Application Type</Label>
          <p className="text-sm text-muted-foreground">
            Select the primary type of application you're building
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {APP_TYPES.map((type) => (
            <Card
              key={type.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                appType === type.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handleAppTypeChange(type.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{type.label}</CardTitle>
                  {appType === type.id && (
                    <Badge variant="default" className="ml-2">
                      Selected
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {type.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Architecture Layers */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Architecture Layers</Label>
          <p className="text-sm text-muted-foreground">
            Enable and configure the architectural layers for your application
          </p>
        </div>

        <div className="space-y-4">
          {layers.map((layer) => (
            <Card key={layer.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Layer Header with Toggle */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`layer-${layer.id}`}
                      checked={layer.enabled}
                      onCheckedChange={() => handleLayerToggle(layer.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={`layer-${layer.id}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {layer.name}
                      </Label>
                      {layer.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {layer.technologies.map((tech, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Textarea (shown when enabled) */}
                  {layer.enabled && (
                    <div className="pl-8 space-y-2">
                      <Label
                        htmlFor={`notes-${layer.id}`}
                        className="text-sm text-muted-foreground"
                      >
                        Notes (optional)
                      </Label>
                      <Textarea
                        id={`notes-${layer.id}`}
                        placeholder={`Add notes about the ${layer.name} layer...`}
                        value={layer.notes}
                        onChange={(e) =>
                          handleLayerNotesChange(layer.id, e.target.value)
                        }
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {layers.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No architecture layers defined yet.
                  {techStack
                    ? " Click 'Apply Smart Defaults' above to get started."
                    : " Complete Step 1 to enable smart defaults."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
