import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock System Engineers
const systemEngineers = [
  { id: "se1", name: "Rahul Sharma", system: "Electrical" },
  { id: "se2", name: "Priya Patel", system: "Powertrain" },
  { id: "se3", name: "Amit Singh", system: "Chassis" },
  { id: "se4", name: "Sneha Gupta", system: "Interiors" },
  { id: "se5", name: "Vikram Malhotra", system: "Body" },
];

type VariantRow = {
  id: string;
  variant: string;
  outgoingModel: string;
  outgoingDesc: string;
  incomingModel: string;
  incomingDesc: string;
};

export default function InitiateChange() {
  const { toast } = useToast();

  const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
  const [projectCode, setProjectCode] = useState("");
  const [variantRows, setVariantRows] = useState<VariantRow[]>([
    {
      id: crypto.randomUUID(),
      variant: "",
      outgoingModel: "",
      outgoingDesc: "",
      incomingModel: "",
      incomingDesc: "",
    },
  ]);

  const handleAssign = (id: string) => {
    setSelectedEngineers(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const addRow = () => {
    setVariantRows(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        variant: "",
        outgoingModel: "",
        outgoingDesc: "",
        incomingModel: "",
        incomingDesc: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    setVariantRows(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (
    id: string,
    field: keyof VariantRow,
    value: string
  ) => {
    setVariantRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        // create project
        const projRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectCode, description: "" }),
        });
        const project = await projRes.json();

        // for each variant create variant + workflow + tasks
        for (const row of variantRows) {
          const vRes = await fetch(`/api/projects/${project.id}/variants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row.variant,
              isBase: false,
              metadata: {
                outgoingModel: row.outgoingModel,
                incomingModel: row.incomingModel,
              },
            }),
          });
          const variant = await vRes.json();

          const wfRes = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project.id,
              variantId: variant.id,
              initiatorId: "local-vie",
            }),
          });
          const workflow = await wfRes.json();

          // assign tasks to selected engineers
          for (const engId of selectedEngineers) {
            await fetch(`/api/workflows/${workflow.id}/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ assignedTo: engId, role: "SE" }),
            });
          }
        }

        toast({
          title: "Change Workflow Initiated",
          description: `Variants: ${variantRows.length}, Engineers: ${selectedEngineers.length}`,
        });

        setSelectedEngineers([]);
        setVariantRows([
          {
            id: crypto.randomUUID(),
            variant: "",
            outgoingModel: "",
            outgoingDesc: "",
            incomingModel: "",
            incomingDesc: "",
          },
        ]);
        setProjectCode("");
      } catch (err) {
        toast({ title: "Failed to initiate workflow", description: String(err) });
      }
    })();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Initiate Change Content</h1>
        <p className="text-muted-foreground mt-2">
          Initiate a new change content workflow
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Define the scope of the change</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols gap-6">
              <div className="space-y-2">
                <Label>Project Code *</Label>
                <Input
                  required
                  placeholder="W601, U171"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Variant Mapping Table */}
            <div className="space-y-3">
              <Label>Outgoing → Incoming Variants</Label>

              <div className="border rounded-md overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr_40px] bg-muted text-xs font-semibold px-3 py-2">
                  <div />
                  <div>Variant</div>
                  <div>Outgoing Model</div>
                  <div>Outgoing Description</div>
                  <div>Incoming Model</div>
                  <div>Incoming Description</div>
                  <div />
                </div>


                {/* Rows */}
                {variantRows.map(row => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr_40px] gap-2 px-3 py-2 border-t items-center"
                  >
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={addRow}
                    >
                      +
                    </Button>

                    <Input
                      placeholder="Variant (e.g. AX7 L Diesel AT)"
                      value={row.variant}
                      onChange={e =>
                        updateRow(row.id, "variant", e.target.value)
                      }
                    />

                    <Input
                      placeholder="Old model"
                      value={row.outgoingModel}
                      onChange={e =>
                        updateRow(row.id, "outgoingModel", e.target.value)
                      }
                    />

                    <Input
                      placeholder="Old description"
                      value={row.outgoingDesc}
                      onChange={e =>
                        updateRow(row.id, "outgoingDesc", e.target.value)
                      }
                    />

                    <Input
                      placeholder="New model"
                      value={row.incomingModel}
                      onChange={e =>
                        updateRow(row.id, "incomingModel", e.target.value)
                      }
                    />

                    <Input
                      placeholder="New description"
                      value={row.incomingDesc}
                      onChange={e =>
                        updateRow(row.id, "incomingDesc", e.target.value)
                      }
                    />

                    {variantRows.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeRow(row.id)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}

              </div>
            </div>

            <Separator />

            {/* Assign Engineers */}
            <div className="space-y-4">
              <Label>Assign System Engineers</Label>

              <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {systemEngineers.map(eng => (
                  <div
                    key={eng.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedEngineers.includes(eng.id)}
                        onCheckedChange={() => handleAssign(eng.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">{eng.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {eng.system}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{eng.system}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="reset">
                Reset
              </Button>
              <Button type="submit">Initiate Workflow</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
