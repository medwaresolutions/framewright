"use client";

import { useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Database, Upload, FileSpreadsheet } from "lucide-react";
import type { DatabaseTable } from "@/types/project";
import { toast } from "sonner";

/** Minimal CSV parser — handles double-quoted fields containing commas */
function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  });
}

const CSV_EXAMPLE = `table_name,description,columns
users,Stores user accounts,"id, email, name, created_at, role"
posts,Blog posts or articles,"id, title, content, author_id, published_at, status"
products,Product catalogue,"id, name, description, price, stock_count, category_id"`;

export function StepDatabase() {
  const { state, dispatch } = useProject();
  const database = state.database;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApproachChange = (
    approach: "plain-english" | "paste-sql" | "import-csv" | "skip"
  ) => {
    dispatch({ type: "SET_DATABASE", payload: { approach } });
  };

  const handlePlainEnglishChange = (plainEnglishDescription: string) => {
    dispatch({ type: "SET_DATABASE", payload: { plainEnglishDescription } });
  };

  const handlePastedSchemaChange = (pastedSchema: string) => {
    dispatch({ type: "SET_DATABASE", payload: { pastedSchema } });
  };

  const handleAddTable = () => {
    const newTable: DatabaseTable = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      columns: "",
    };
    dispatch({
      type: "SET_DATABASE",
      payload: { tables: [...database.tables, newTable] },
    });
  };

  const handleRemoveTable = (tableId: string) => {
    dispatch({
      type: "SET_DATABASE",
      payload: { tables: database.tables.filter((t) => t.id !== tableId) },
    });
  };

  const handleTableChange = (
    tableId: string,
    field: keyof DatabaseTable,
    value: string
  ) => {
    dispatch({
      type: "SET_DATABASE",
      payload: {
        tables: database.tables.map((t) =>
          t.id === tableId ? { ...t, [field]: value } : t
        ),
      },
    });
  };

  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rows = parseCSV(text);
        if (rows.length < 2) {
          toast.error("CSV must have a header row and at least one data row");
          return;
        }
        const headers = rows[0].map((h) => h.toLowerCase().trim());
        const nameIdx = headers.findIndex((h) =>
          ["table_name", "name", "table"].includes(h)
        );
        const descIdx = headers.findIndex((h) =>
          ["description", "desc", "notes"].includes(h)
        );
        const colIdx = headers.findIndex((h) =>
          ["columns", "cols", "fields"].includes(h)
        );

        if (nameIdx === -1) {
          toast.error(
            'CSV must have a "table_name" column. See the example format.'
          );
          return;
        }

        const importedTables: DatabaseTable[] = rows
          .slice(1)
          .filter((row) => row[nameIdx]?.trim())
          .map((row) => ({
            id: crypto.randomUUID(),
            name: row[nameIdx]?.trim() ?? "",
            description: descIdx >= 0 ? (row[descIdx]?.trim() ?? "") : "",
            columns: colIdx >= 0 ? (row[colIdx]?.trim() ?? "") : "",
          }));

        if (importedTables.length === 0) {
          toast.error("No valid table rows found in CSV");
          return;
        }

        dispatch({
          type: "SET_DATABASE",
          payload: {
            approach: "import-csv",
            tables: [...database.tables, ...importedTables],
          },
        });
        toast.success(
          `Imported ${importedTables.length} table${importedTables.length !== 1 ? "s" : ""}`
        );
      } catch {
        toast.error("Failed to parse CSV — check the file format");
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCSVFile(file);
    // Reset so the same file can be re-imported
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Database Schema</h2>
          {database.tables.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Database className="h-3 w-3" />
              {database.tables.length}{" "}
              {database.tables.length === 1 ? "table" : "tables"}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Define your database structure. Describe it, paste SQL, import a CSV,
          or skip for now.
        </p>
      </div>

      <Tabs
        value={database.approach}
        onValueChange={(value) =>
          handleApproachChange(value as typeof database.approach)
        }
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plain-english">Plain English</TabsTrigger>
          <TabsTrigger value="paste-sql">Paste SQL</TabsTrigger>
          <TabsTrigger value="import-csv">Import CSV</TabsTrigger>
          <TabsTrigger value="skip">Skip</TabsTrigger>
        </TabsList>

        <TabsContent value="plain-english" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plain-english-description">
              Describe your database
            </Label>
            <Textarea
              id="plain-english-description"
              placeholder="Example: I need a users table with email, name, and created_at. Also a posts table with title, content, author_id (references users), and published_at..."
              value={database.plainEnglishDescription}
              onChange={(e) => handlePlainEnglishChange(e.target.value)}
              rows={8}
              className="font-sans"
            />
            <p className="text-sm text-muted-foreground">
              Describe your database structure in plain language. We'll help you
              refine it later.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="paste-sql" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pasted-schema">SQL Schema</Label>
            <Textarea
              id="pasted-schema"
              placeholder={
                "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  name VARCHAR(255),\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE posts (...);"
              }
              value={database.pastedSchema}
              onChange={(e) => handlePastedSchemaChange(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Paste your CREATE TABLE statements or existing schema here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="import-csv" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="font-semibold">Import from CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV with one row per table. Required column:{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      table_name
                    </code>
                    . Optional:{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      description
                    </code>
                    ,{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      columns
                    </code>
                    .
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Example CSV format
                </Label>
                <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre">
                  {CSV_EXAMPLE}
                </pre>
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV file
                </Button>
              </div>

              {database.tables.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {database.tables.length} table
                  {database.tables.length !== 1 ? "s" : ""} imported. You can
                  edit them below or upload another file to add more.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skip" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Database className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">Skip database setup</h3>
                <p className="text-sm text-muted-foreground">
                  You can define your database schema later. We'll focus on
                  other aspects of your project for now.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {database.approach !== "skip" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tables</h3>
            <Button onClick={handleAddTable} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </div>

          {database.tables.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  No tables defined yet. Click "Add Table" to create one
                  {database.approach === "import-csv"
                    ? " or upload a CSV above"
                    : ""}
                  .
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {database.tables.map((table) => (
                <Card key={table.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`table-name-${table.id}`}>
                            Table Name
                          </Label>
                          <Input
                            id={`table-name-${table.id}`}
                            placeholder="e.g., users, posts, products"
                            value={table.name}
                            onChange={(e) =>
                              handleTableChange(table.id, "name", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`table-description-${table.id}`}>
                            Description
                          </Label>
                          <Textarea
                            id={`table-description-${table.id}`}
                            placeholder="What does this table store?"
                            value={table.description}
                            onChange={(e) =>
                              handleTableChange(
                                table.id,
                                "description",
                                e.target.value
                              )
                            }
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`table-columns-${table.id}`}>
                            Columns
                          </Label>
                          <Textarea
                            id={`table-columns-${table.id}`}
                            placeholder='e.g., "id, email, name, created_at, role"'
                            value={table.columns}
                            onChange={(e) =>
                              handleTableChange(
                                table.id,
                                "columns",
                                e.target.value
                              )
                            }
                            rows={2}
                          />
                          <p className="text-xs text-muted-foreground">
                            Comma-separated column names
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTable(table.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove table</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
