"use client";

import { useProject } from "@/contexts/project-context";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Database } from "lucide-react";
import type { DatabaseTable } from "@/types/project";

export function StepDatabase() {
  const { state, dispatch } = useProject();
  const database = state.database;

  const handleApproachChange = (approach: "plain-english" | "paste-sql" | "skip") => {
    dispatch({
      type: "SET_DATABASE",
      payload: { approach }
    });
  };

  const handlePlainEnglishChange = (plainEnglishDescription: string) => {
    dispatch({
      type: "SET_DATABASE",
      payload: { plainEnglishDescription }
    });
  };

  const handlePastedSchemaChange = (pastedSchema: string) => {
    dispatch({
      type: "SET_DATABASE",
      payload: { pastedSchema }
    });
  };

  const handleAddTable = () => {
    const newTable: DatabaseTable = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      columns: ""
    };

    dispatch({
      type: "SET_DATABASE",
      payload: {
        tables: [...database.tables, newTable]
      }
    });
  };

  const handleRemoveTable = (tableId: string) => {
    dispatch({
      type: "SET_DATABASE",
      payload: {
        tables: database.tables.filter(t => t.id !== tableId)
      }
    });
  };

  const handleTableChange = (tableId: string, field: keyof DatabaseTable, value: string) => {
    dispatch({
      type: "SET_DATABASE",
      payload: {
        tables: database.tables.map(t =>
          t.id === tableId ? { ...t, [field]: value } : t
        )
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Database Schema</h2>
          {database.tables.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Database className="h-3 w-3" />
              {database.tables.length} {database.tables.length === 1 ? "table" : "tables"}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Define your database structure. You can describe it in plain English, paste SQL, or skip for now.
        </p>
      </div>

      <Tabs value={database.approach} onValueChange={(value) => handleApproachChange(value as typeof database.approach)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plain-english">Plain English</TabsTrigger>
          <TabsTrigger value="paste-sql">Paste SQL</TabsTrigger>
          <TabsTrigger value="skip">Skip</TabsTrigger>
        </TabsList>

        <TabsContent value="plain-english" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plain-english-description">Describe your database</Label>
            <Textarea
              id="plain-english-description"
              placeholder="Example: I need a users table with email, name, and created_at. Also a posts table with title, content, author_id (references users), and published_at..."
              value={database.plainEnglishDescription}
              onChange={(e) => handlePlainEnglishChange(e.target.value)}
              rows={8}
              className="font-sans"
            />
            <p className="text-sm text-muted-foreground">
              Describe your database structure in plain language. We'll help you refine it later.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="paste-sql" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pasted-schema">SQL Schema</Label>
            <Textarea
              id="pasted-schema"
              placeholder="CREATE TABLE users (&#10;  id SERIAL PRIMARY KEY,&#10;  email VARCHAR(255) UNIQUE NOT NULL,&#10;  name VARCHAR(255),&#10;  created_at TIMESTAMP DEFAULT NOW()&#10;);&#10;&#10;CREATE TABLE posts (...);"
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

        <TabsContent value="skip" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Database className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">Skip database setup</h3>
                <p className="text-sm text-muted-foreground">
                  You can define your database schema later. We'll focus on other aspects of your project for now.
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
                  No tables defined yet. Click "Add Table" to create one.
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
                          <Label htmlFor={`table-name-${table.id}`}>Table Name</Label>
                          <Input
                            id={`table-name-${table.id}`}
                            placeholder="e.g., users, posts, products"
                            value={table.name}
                            onChange={(e) => handleTableChange(table.id, "name", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`table-description-${table.id}`}>Description</Label>
                          <Textarea
                            id={`table-description-${table.id}`}
                            placeholder="What does this table store?"
                            value={table.description}
                            onChange={(e) => handleTableChange(table.id, "description", e.target.value)}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`table-columns-${table.id}`}>Columns</Label>
                          <Textarea
                            id={`table-columns-${table.id}`}
                            placeholder="Describe the columns for this table..."
                            value={table.columns}
                            onChange={(e) => handleTableChange(table.id, "columns", e.target.value)}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Free-text description of columns (e.g., "id, email, name, created_at")
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
