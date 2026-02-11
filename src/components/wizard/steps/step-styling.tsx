"use client";

import { useProject } from "@/contexts/project-context";
import { componentLibraryOptions } from "@/data/tech-stacks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const headingFontSuggestions = [
  "Inter",
  "Geist",
  "Poppins",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Outfit",
];

const bodyFontSuggestions = [
  "Inter",
  "Geist",
  "Source Sans 3",
  "IBM Plex Sans",
  "Nunito Sans",
];

const monoFontSuggestions = [
  "JetBrains Mono",
  "Geist Mono",
  "Fira Code",
  "Source Code Pro",
];

export function StepStyling() {
  const { state, dispatch } = useProject();
  const { colors, fonts, componentLibrary, additionalNotes } = state.styling;

  const updateColor = (id: string, field: "name" | "hex", value: string) => {
    const updatedColors = colors.map((color) =>
      color.id === id ? { ...color, [field]: value } : color
    );
    dispatch({ type: "SET_STYLING", payload: { colors: updatedColors } });
  };

  const updateFont = (field: keyof typeof fonts, value: string) => {
    dispatch({
      type: "SET_STYLING",
      payload: {
        fonts: {
          ...fonts,
          [field]: value,
        },
      },
    });
  };

  const updateComponentLibrary = (value: string) => {
    dispatch({ type: "SET_STYLING", payload: { componentLibrary: value } });
  };

  const updateAdditionalNotes = (value: string) => {
    dispatch({ type: "SET_STYLING", payload: { additionalNotes: value } });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Styling &amp; Brand
        </h2>
        <p className="mt-1 text-muted-foreground">
          Define your brand colors, typography, and component library
        </p>
      </div>

      {/* Brand Colors Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Brand Colors</h3>
          <p className="text-sm text-muted-foreground">
            Define your primary color palette
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {colors.map((color) => (
            <div key={color.id} className="space-y-2">
              <Label htmlFor={`color-${color.id}`} className="text-sm">
                {color.name}
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    id={`color-${color.id}`}
                    value={color.hex}
                    onChange={(e) => updateColor(color.id, "hex", e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-input"
                  />
                </div>
                <Input
                  type="text"
                  value={color.hex}
                  onChange={(e) => updateColor(color.id, "hex", e.target.value)}
                  placeholder="#000000"
                  className="flex-1 font-mono text-xs uppercase"
                  maxLength={7}
                />
              </div>
              <Input
                type="text"
                value={color.name}
                onChange={(e) => updateColor(color.id, "name", e.target.value)}
                placeholder="Color name"
                className="text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fonts Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Typography</h3>
          <p className="text-sm text-muted-foreground">
            Choose your font families for different use cases
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Heading Font */}
          <div className="space-y-2">
            <Label htmlFor="heading-font">Heading Font</Label>
            <Select value={fonts.heading} onValueChange={(v) => updateFont("heading", v)}>
              <SelectTrigger id="heading-font">
                <SelectValue placeholder="Select heading font" />
              </SelectTrigger>
              <SelectContent>
                {headingFontSuggestions.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Body Font */}
          <div className="space-y-2">
            <Label htmlFor="body-font">Body Font</Label>
            <Select value={fonts.body} onValueChange={(v) => updateFont("body", v)}>
              <SelectTrigger id="body-font">
                <SelectValue placeholder="Select body font" />
              </SelectTrigger>
              <SelectContent>
                {bodyFontSuggestions.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mono Font */}
          <div className="space-y-2">
            <Label htmlFor="mono-font">Mono Font</Label>
            <Select value={fonts.mono} onValueChange={(v) => updateFont("mono", v)}>
              <SelectTrigger id="mono-font">
                <SelectValue placeholder="Select mono font" />
              </SelectTrigger>
              <SelectContent>
                {monoFontSuggestions.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Component Library Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Component Library</h3>
          <p className="text-sm text-muted-foreground">
            Choose a UI component library for your project
          </p>
        </div>
        <div className="max-w-md">
          <Select value={componentLibrary} onValueChange={updateComponentLibrary}>
            <SelectTrigger>
              <SelectValue placeholder="Select component library" />
            </SelectTrigger>
            <SelectContent>
              {componentLibraryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Notes Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Additional Styling Notes</h3>
          <p className="text-sm text-muted-foreground">
            Any extra styling guidelines, design tokens, or visual preferences
          </p>
        </div>
        <Textarea
          value={additionalNotes}
          onChange={(e) => updateAdditionalNotes(e.target.value)}
          placeholder="e.g., Rounded corners everywhere, shadows for depth, dark mode support..."
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  );
}
