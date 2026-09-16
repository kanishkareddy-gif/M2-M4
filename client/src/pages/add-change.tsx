
import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/components/RoleContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Upload, Download, Save, RefreshCw, Filter, Copy, Search, ArrowLeft, LayoutList, Clock } from "lucide-react";
import { BOMTable, BOMItem } from "@/components/bom-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Updated Mock BOM Data with paired structure
const initialBOMData: BOMItem[] = [
  {
    id: "1",
    level: 1,
    system: "ELECTRICAL - WIRING HARNESS",
    status: "Add",

    outgoingPartNo: "0013AB20002VS",
    outgoingDesc: "LAYOUT WIRING HARNESS",
    outgoingQtyPerVehicle: 1,
    outgoingVehicleEndItem: "NA",

    incomingPartNo: "0013AB20002VS",
    incomingDesc: "LAYOUT WIRING HARNESS",
    incomingQtyPerVehicle: 1,
    incomingVehicleEndItem: "NA",

    remarks: "Base layout unchanged",
  },
  {
    id: "2",
    level: 2,
    system: "Dash Wiring",
    status: "Add",

    outgoingPartNo: "0013AB20003VS",
    outgoingDesc: "DASH WIRING HARNESS",
    outgoingQtyPerVehicle: 1,

    incomingPartNo: "0013AB20003VS",
    incomingDesc: "DASH WIRING HARNESS",
    incomingQtyPerVehicle: 1,

    remarks: "Carry over from base",
  },
  {
    id: "3",
    level: 2,
    system: "Engine Wiring",
    status: "Delete",

    outgoingPartNo: "0013AB20004VS",
    outgoingDesc: "ENG WIRING HARNESS (DSL)",
    outgoingQtyPerVehicle: 1,

    remarks: "Deleted for Petrol variant",
  },
  {
    id: "4",
    level: 2,
    system: "Door Wiring",
    status: "Add",

    incomingPartNo: "0013AB20005VS",
    incomingDesc: "DOOR WIRING HARNESS (HIGH)",
    incomingQtyPerVehicle: 1,

    remarks: "Added for high spec audio",
  },
  {
    id: "5",
    level: 1,
    system: "ELECTRICAL - MODULES SENSORS",
    status: "Delete",

    outgoingPartNo: "0013AB20006VS",
    outgoingDesc: "LAYOUT MODULES",

    incomingPartNo: "0013AB20006VS",
    incomingDesc: "LAYOUT MODULES",
  },
  {
    id: "6",
    level: 2,
    system: "ECU",
    status: "Modify",

    outgoingPartNo: "0013AB20007VS",
    outgoingDesc: "ENGINE CONTROL UNIT (GEN 1)",

    incomingPartNo: "0013AB20008VS",
    incomingDesc: "ENGINE CONTROL UNIT (GEN 2)",

    remarks: "Upgraded for emission norms",
  },
  {
    id: "7",
    level: 1,
    system: "EXTERIOR TRIMS",
    status: "Delete",

    outgoingPartNo: "0013AB20009VS",
    outgoingDesc: "LAYOUT EXT TRIMS (CHROME)",

    remarks: "Removed chrome package",
  },
  {
    id: "8",
    level: 2,
    system: "Bumper Front",
    status: "Add",

    incomingPartNo: "0013AB20010VS",
    incomingDesc: "FRT BUMPER ASSY (SPORT)",

    remarks: "New sport bumper design",
  },
];


// Mock Requests List
const tasksList = [
  { 
    id: "REQ-2024-001", 
    variant: "AX7 L Diesel AT AWD", 
    project: "U171",
    status: "In Progress", 
    system: "Electrical",
    date: "Nov 25, 2024",
    baseModel: "AW62AYZS7TA11D00WQ",
    newModel: "AW62AYZS7TA11D00WQ"
  },
  { 
    id: "REQ-2024-005", 
    variant: "MX Petrol MT", 
    project: "W601",
    status: "Initiated", 
    system: "Powertrain",
    date: "Nov 20, 2024",
    baseModel: "BX52AYZS7TA11D00WQ",
    newModel: "BX52AYZS7TA11D00WQ"
  },
  { 
    id: "REQ-2024-008", 
    variant: "AX5 Diesel MT", 
    project: "U171",
    status: "For Review", 
    system: "Body",
    date: "Nov 26, 2024",
    baseModel: "CX42AYZS7TA11D00WQ",
    newModel: "CX42AYZS7TA11D00WQ"
  }
];

export default function AddChange() {
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const [activeRequest, setActiveRequest] = useState<string | null>(null); // Initially null to show list
  const [bomData, setBomData] = useState<BOMItem[]>(initialBOMData);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const roleMeta: Record<"SE" | "PCL" | "CDM" | "PM", { title: string; subtitle: string; action: string }> = {
    SE: { title: "My Tasks", subtitle: "Select a change request to start working on BOM content.", action: "Save Changes" },
    PCL: { title: "PCL Cost Review", subtitle: "Review outgoing vs incoming BOM cost impact and submit the assessment.", action: "Submit Cost Review" },
    CDM: { title: "CDM Investment Review", subtitle: "Review the completed PCL assessment and add investment details.", action: "Submit Investment Review" },
    PM: { title: "Monitoring View", subtitle: "Read-only overview of project and variant progress.", action: "View Only" },
  };

  const activeRoleMeta = roleMeta[role as keyof typeof roleMeta] ?? roleMeta.SE;

  const roleTasks = useMemo(() => {
    if (role === "SE") return tasksList;
    if (role === "PCL") return [{
      ...tasksList[0],
      project: "W601",
      variant: "XUV700 MX Petrol MT",
      system: "Cost Review",
      status: "For Review",
      baseModel: "BX52AYZS7TA11D00WQ",
      newModel: "BX52AYZS7TA11D00WQ",
    }];
    if (role === "CDM") return [{
      ...tasksList[2],
      project: "S201",
      variant: "XUV300 Sport",
      system: "Investment Review",
      status: "In Progress",
      baseModel: "CX42AYZS7TA11D00WQ",
      newModel: "CX42AYZS7TA11D00WQ",
    }];
    return [{
      ...tasksList[0],
      system: "Monitoring View",
      status: "Read Only",
      baseModel: "AW62AYZS7TA11D00WQ",
      newModel: "AW62AYZS7TA11D00WQ",
    }];
  }, [role]);

  const selectedTask = roleTasks.find(t => t.id === activeRequest);

  const filteredBOMData = bomData.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    return (
      item.outgoingPartNo?.toLowerCase().includes(q) ||
      item.incomingPartNo?.toLowerCase().includes(q) ||
      item.outgoingDesc?.toLowerCase().includes(q) ||
      item.incomingDesc?.toLowerCase().includes(q)
    );
  });



  const handleCopyFrom = () => {
    // Logic to copy from another project
    toast({
        title: "Data Copied",
        description: "BOM data copied from Project W601 - Variant MX Petrol",
    });
    setIsCopyDialogOpen(false);
  };

  const handleFileSelected = async (file?: File | null) => {
    if (!file) return;
    const text = await file.text();
    // naive CSV parser: assume header row and comma-separated
    const rows = text.split(/\r?\n/).filter(Boolean);
    const header = rows.shift()?.split(",") ?? [];
    const parsed: BOMItem[] = rows.map((line, idx) => {
      const cols = line.split(",");
      const obj: any = {};
      header.forEach((h, i) => (obj[h.trim()] = cols[i]?.trim() ?? ""));
      return {
        id: String(idx + 1 + Math.floor(Math.random() * 10000)),
        level: Number(obj.level) || 1,
        system: obj.system || "",
        status: (obj.status as BOMItem["status"]) || "Add",
        outgoingPartNo: obj.outgoingPartNo || null,
        outgoingDesc: obj.outgoingDesc || null,
        outgoingQtyPerVehicle: obj.outgoingQtyPerVehicle ? Number(obj.outgoingQtyPerVehicle) : null,
        incomingPartNo: obj.incomingPartNo || null,
        incomingDesc: obj.incomingDesc || null,
        incomingQtyPerVehicle: obj.incomingQtyPerVehicle ? Number(obj.incomingQtyPerVehicle) : null,
        remarks: obj.remarks || null,
      } as BOMItem;
    });
    setBomData(parsed);
    toast({ title: "File parsed", description: `Imported ${parsed.length} rows` });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!selectedTask) return;
    try {
      for (const row of bomData) {
        await fetch(`/api/workflows/${selectedTask.id}/bom`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partNumber: row.incomingPartNo || row.outgoingPartNo,
            description: row.incomingDesc || row.outgoingDesc,
            changeType: row.status,
            quantity: row.incomingQtyPerVehicle ?? row.outgoingQtyPerVehicle ?? 1,
            remarks: row.remarks,
          }),
        });
      }
      toast({ title: "Saved", description: `Saved ${bomData.length} rows` });
    } catch (err) {
      toast({ title: "Save failed", description: String(err) });
    }
  };

  // Task List View
  if (!activeRequest) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{activeRoleMeta.title}</h1>
            <p className="text-muted-foreground mt-2">
              {activeRoleMeta.subtitle}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {roleTasks.map((task) => (
            <Card 
              key={task.id} 
              className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-primary"
              onClick={() => setActiveRequest(task.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {task.id}
                      <Badge variant="outline" className="font-normal text-xs">Rev 01</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium text-foreground">
                      {task.project} - {task.variant}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 border ${
                      task.status === "Initiated" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      task.status === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      task.status === "For Review" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <LayoutList className="h-4 w-4" />
                    <span>System: <span className="font-medium text-foreground">{task.system}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Assigned: {task.date}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs bg-muted/30 p-2 rounded border border-border/50 group-hover:bg-muted/50 transition-colors">
                   <span className="font-medium">Outgoing Model:</span> {task.baseModel}
                   <span className="mx-2 text-muted-foreground">→</span>
                   <span className="font-medium">Incoming Model:</span> {task.newModel}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Workspace View (BOM Editor)
  return (
    <div className="space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveRequest(null)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {selectedTask?.id}
              <Badge variant="outline" className="text-sm font-normal">Rev 01</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedTask?.project} - {selectedTask?.variant}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
             <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy From
                </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                 <DialogTitle>Copy Change Content</DialogTitle>
                 <DialogDescription>
                   Select a previous project to copy BOM structure from.
                 </DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="project" className="text-right">
                     Project
                   </Label>
                   <Select>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="w601">W601 (XUV700)</SelectItem>
                            <SelectItem value="u321">U321 (Marazzo)</SelectItem>
                            <SelectItem value="s201">S201 (XUV300)</SelectItem>
                        </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="variant" className="text-right">
                     Variant
                   </Label>
                   <Select>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Variant" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ax7">AX7 L Diesel AT</SelectItem>
                            <SelectItem value="mx">MX Petrol MT</SelectItem>
                        </SelectContent>
                   </Select>
                 </div>
               </div>
               <DialogFooter>
                 <Button type="submit" onClick={handleCopyFrom}>Copy Data</Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>

           <Button variant="outline" className="gap-2">
             <Download className="h-4 w-4" />
             Template
           </Button>
           <input
             ref={fileInputRef}
             type="file"
             accept=".csv"
             className="hidden"
             onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
           />
           <Button onClick={handleUploadClick} className="bg-primary hover:bg-primary/90 gap-2">
             <Upload className="h-4 w-4" />
             Upload CSV
           </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 min-h-0 flex flex-col">
           <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm">
             <div className="p-4 border-b flex items-center justify-between bg-muted/5">
               <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-50 text-red-700 border border-red-100">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="font-mono">{selectedTask?.baseModel}</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-green-50 text-green-700 border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-mono">{selectedTask?.newModel}</span>
                  </div>
               </div>
               
               <div className="flex gap-2 items-center">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search Part No / Description"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 w-64 text-sm"
                    />
                  </div>

                  <Button size="sm" variant="outline" className="h-8">
                    <Filter className="h-3 w-3 mr-1" /> Filter
                  </Button>

                  <Button size="sm" variant="outline" className="h-8">
                    <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                  </Button>

                  <div className="w-px h-8 bg-border mx-1"></div>

                  {(role === "SE" || role === "PCL" || role === "CDM") && (
                    <Button
                      onClick={handleSave}
                      size="sm"
                      variant="default"
                      className="bg-primary text-white h-8 shadow-sm hover:bg-primary/90"
                    >
                      <Save className="h-3 w-3 mr-1" /> {activeRoleMeta.action}
                    </Button>
                  )}
                </div>

             </div>

             <div className="flex-1 overflow-auto p-0 bg-background">
               <BOMTable data={filteredBOMData} role={role}/>
               
               {role === "PCL" && (
                 <div className="grid gap-4 border-t bg-muted/5 p-4 md:grid-cols-3">
                   <div className="rounded-md border bg-white p-3">
                     <div className="text-xs text-muted-foreground">Initial Cost</div>
                     <div className="mt-1 text-xl font-bold text-foreground">₹ 48,500</div>
                   </div>
                   <div className="rounded-md border bg-white p-3">
                     <div className="text-xs text-muted-foreground">Submitted / Updated Cost</div>
                     <div className="mt-1 text-xl font-bold text-foreground">₹ 52,900</div>
                   </div>
                   <div className="rounded-md border bg-white p-3">
                     <div className="text-xs text-muted-foreground">Cost Delta</div>
                     <div className="mt-1 text-xl font-bold text-green-600">₹ 4,400</div>
                   </div>
                 </div>
               )}

               {role === "CDM" && (
                 <div className="grid gap-4 border-t bg-muted/5 p-4 md:grid-cols-3">
                   <div className="rounded-md border bg-white p-3">
                     <div className="text-xs text-muted-foreground">ROCM Cost</div>
                     <div className="mt-1 text-xl font-bold text-foreground">₹ 12,500</div>
                   </div>
                   <div className="rounded-md border bg-white p-3">
                     <div className="text-xs text-muted-foreground">SBC Cost</div>
                     <div className="mt-1 text-xl font-bold text-foreground">₹ 8,300</div>
                   </div>
                   <div className="rounded-md border bg-white p-3">
                     <div className="text-xs text-muted-foreground">Estimation Cost</div>
                     <div className="mt-1 text-xl font-bold text-foreground">₹ 20,800</div>
                   </div>
                 </div>
               )}
               
               {/* Empty State Helper */}
               {bomData.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                   <p>No change content added yet.</p>
                   <Button variant="link" className="mt-2">Upload Excel or Copy From Previous</Button>
                 </div>
               )}
             </div>
             
             <div className="p-2 border-t bg-muted/5 text-xs text-muted-foreground flex justify-between px-4 items-center h-10">
                <div className="flex gap-4">
                    <span>Rows: <strong>{bomData.length}</strong></span>
                    <span>Add: <strong className="text-green-600">3</strong></span>
                    <span>Delete: <strong className="text-red-600">2</strong></span>
                </div>
                <span className="italic">Last auto-saved 2 mins ago</span>
             </div>
           </Card>
      </div>
    </div>
  );
}
