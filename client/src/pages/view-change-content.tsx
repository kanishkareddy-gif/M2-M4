
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, IndianRupee, FileText, Layers, AlertCircle, Clock, CheckCircle2, ArrowLeft, Activity, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bomDataByRequestId } from "@/components/bomDataByRequestId";
import { useRole } from "@/components/RoleContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Fragment, useEffect, useMemo, useState } from "react";
import { BOMTable } from "@/components/bom-table";
import type { Role } from "@/components/RoleContext";

const costData = [
  { name: "Delete Costs", amount: 12500, color: "#ef4444" }, // Red for Delete
  { name: "Carry Forward", amount: 45000, color: "#94a3b8" }, // Gray for Carry Over
  { name: "Add Costs", amount: 18200, color: "#22c55e" }, // Green for Add
];

const systemBreakdown = [
  { name: "Electrical", value: 35 },
  { name: "Powertrain", value: 25 },
  { name: "Body", value: 20 },
  { name: "Interiors", value: 15 },
  { name: "Chassis", value: 5 },
];

// Mock Initiated Requests History for Dashboard
const initialActiveRequests = [
  {
    req_id: "REQ-2024-001",
    project: "U171",
    project_version: "M4",
    variant: "AX7 L Diesel AT AWD",
    variant_version: "V1",
    status: "In Progress",
    assigned_date: "2024-11-25",
    completed_date: null,
    assigned_by: "PCL_Ajay",
    assigned_to: "VOB_Electrical",
    pending: ["Electrical", "Interiors"],
    completed: ["Powertrain", "Chassis", "Body"],
    addCost: 18200,
    deleteCost: 12500,
    carryForwardCost: 45000,
    totalCost: 63200,
  },
  {
    req_id: "REQ-2024-002",
    project: "W601",
    project_version: "M4",
    variant: "XUV700 MX Petrol MT",
    variant_version: "V2",
    status: "Completed",
    assigned_date: "2024-11-18",
    completed_date: "2024-11-20",
    assigned_by: "PCL_Ravi",
    assigned_to: "VOB_Core",
    pending: [],
    completed: ["All Systems"],
    addCost: 15000,
    deleteCost: 10000,
    carryForwardCost: 40000,
    totalCost: 55000,
  },
  {
    req_id: "REQ-2024-003",
    project: "U171",
    project_version: "M4",
    variant: "AX5 Diesel MT",
    variant_version: "V3",
    status: "For Review",
    assigned_date: "2024-11-26",
    completed_date: null,
    assigned_by: "PCL_Ajay",
    assigned_to: "VOB_Powertrain",
    pending: [],
    completed: ["All Systems"],
    addCost: 20000,
    deleteCost: 14000,
    carryForwardCost: 48000,
    totalCost: 68000,
  },
  {
    req_id: "REQ-2024-004",
    project: "W601",
    project_version: "M4",
    variant: "XUV700 AX3 Petrol AT",
    variant_version: "V1",
    status: "Initiated",
    assigned_date: "2024-11-27",
    completed_date: null,
    assigned_by: "PCL_Meena",
    assigned_to: "VOB_All",
    pending: ["Electrical", "Powertrain", "Body", "Interiors", "Chassis"],
    completed: [],
    addCost: 12000,
    deleteCost: 8000,
    carryForwardCost: 35000,
    totalCost: 47000,
  },
  {
    req_id: "REQ-2024-005",
    project: "S201",
    project_version: "M3",
    variant: "XUV300 W8 Diesel",
    variant_version: "V2",
    status: "Completed",
    assigned_date: "2024-11-15",
    completed_date: "2024-11-15",
    assigned_by: "PCL_Suresh",
    assigned_to: "VOB_Core",
    pending: [],
    completed: ["All Systems"],
    addCost: 22000,
    deleteCost: 16000,
    carryForwardCost: 50000,
    totalCost: 72000,
  },
  {
    req_id: "REQ-2024-006",
    project: "S201",
    project_version: "M3",
    variant: "XUV300 W6 Petrol",
    variant_version: "V1",
    status: "In Progress",
    assigned_date: "2024-11-24",
    completed_date: null,
    assigned_by: "PCL_Suresh",
    assigned_to: "VOB_Interiors",
    pending: ["Interiors"],
    completed: ["Electrical", "Body", "Chassis", "Powertrain"],
    addCost: 9800,
    deleteCost: 6000,
    carryForwardCost: 42000,
    totalCost: 45800,
  },
  {
    req_id: "REQ-2024-007",
    project: "U171",
    project_version: "M5",
    variant: "AX7 Petrol AT",
    variant_version: "V1",
    status: "Initiated",
    assigned_date: "2024-11-28",
    completed_date: null,
    assigned_by: "PCL_Ajay",
    assigned_to: "VOB_All",
    pending: ["Electrical", "Powertrain", "Body", "Interiors", "Chassis"],
    completed: [],
    addCost: 30000,
    deleteCost: 18000,
    carryForwardCost: 60000,
    totalCost: 72000,
  },
  {
    req_id: "REQ-2024-008",
    project: "W601",
    project_version: "M5",
    variant: "XUV700 AX7L Diesel AT",
    variant_version: "V3",
    status: "For Review",
    assigned_date: "2024-11-22",
    completed_date: null,
    assigned_by: "PCL_Ravi",
    assigned_to: "VOB_Powertrain",
    pending: [],
    completed: ["All Systems"],
    addCost: 26000,
    deleteCost: 12000,
    carryForwardCost: 55000,
    totalCost: 69000,
  },
  {
    req_id: "REQ-2024-009",
    project: "S201",
    project_version: "M4",
    variant: "XUV300 Sport",
    variant_version: "V1",
    status: "In Progress",
    assigned_date: "2024-11-23",
    completed_date: null,
    assigned_by: "PCL_Meena",
    assigned_to: "VOB_Body",
    pending: ["Body"],
    completed: ["Electrical", "Powertrain", "Interiors", "Chassis"],
    addCost: 14000,
    deleteCost: 9000,
    carryForwardCost: 38000,
    totalCost: 43000,
  },
  {
    req_id: "REQ-2024-010",
    project: "U171",
    project_version: "M5",
    variant: "AX5 Petrol MT",
    variant_version: "V2",
    status: "Completed",
    assigned_date: "2024-11-10",
    completed_date: "2024-11-13",
    assigned_by: "PCL_Ajay",
    assigned_to: "VOB_Core",
    pending: [],
    completed: ["All Systems"],
    addCost: 17500,
    deleteCost: 11000,
    carryForwardCost: 47000,
    totalCost: 53500,
  },
];

const roleBasedRequestIds: Record<Role, string[]> = {
  VIE: ["REQ-2024-001", "REQ-2024-003", "REQ-2024-004", "REQ-2024-007"],
  SE: ["REQ-2024-001", "REQ-2024-004", "REQ-2024-006"],
  PCL: ["REQ-2024-001", "REQ-2024-002", "REQ-2024-003", "REQ-2024-008"],
  CDM: ["REQ-2024-002", "REQ-2024-005", "REQ-2024-010"],
  PM: ["REQ-2024-001", "REQ-2024-002", "REQ-2024-003", "REQ-2024-004", "REQ-2024-006", "REQ-2024-009"],
};

export default function ViewChangeContent() {
  const { role } = useRole();

  const [activeRequests, setActiveRequests] = useState(() =>
    initialActiveRequests.filter(request => roleBasedRequestIds[role].includes(request.req_id))
  );

  useEffect(() => {
    setActiveRequests(
      initialActiveRequests.filter(request => roleBasedRequestIds[role].includes(request.req_id))
    );
  }, [role]);

  const handleApprove = (reqId: string) => {
    setActiveRequests(prev =>
      prev.map(req =>
        req.req_id === reqId
          ? {
              ...req,
              status: "Completed",
              completed_date: new Date().toISOString().split("T")[0],
              pending: [],
              completed: ["All Systems"],
            }
          : req
      )
    );
  };

  const handleReject = (reqId: string) => {
    setActiveRequests(prev =>
      prev.map(req =>
        req.req_id === reqId
          ? {
              ...req,
              status: "Rejected",
              completed_date: new Date().toISOString().split("T")[0],
              pending: [],
              completed: [],
            }
          : req
      )
    );
  };

  const isPCL = role === "PCL";
  const isPM = role === "PM";
  const isCDM = role === "CDM";
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("ALL");

  useEffect(() => {
    if (role === "SE") setSelectedProject("U171");
    else if (role === "PCL") setSelectedProject("W601");
    else if (role === "CDM") setSelectedProject("S201");
    else setSelectedProject("ALL");
  }, [role]);

  const selectedRequest = activeRequests.find(req => req.req_id === selectedRequestId);
  const projectStageProgress = selectedRequest ? {
    stage: selectedRequest.status,
    percent: selectedRequest.status === "Completed" ? 100 : selectedRequest.status === "For Review" ? 75 : selectedRequest.status === "In Progress" ? 55 : selectedRequest.status === "Rejected" ? 20 : 30,
    currentOwner: selectedRequest.status === "Completed"
      ? "Completed"
      : selectedRequest.status === "For Review"
        ? "PCL"
        : selectedRequest.status === "In Progress"
          ? "System Engineer"
          : selectedRequest.status === "Rejected"
            ? "VIE"
            : "Vehicle Integration Engineer",
    pendingOn: selectedRequest.status === "Completed"
      ? "Completed across all variants"
      : selectedRequest.status === "For Review"
        ? "Awaiting final PCL review and approval"
        : selectedRequest.status === "In Progress"
          ? "With System Engineer for detailed evaluation"
          : selectedRequest.status === "Rejected"
            ? "Returned to VIE for rework"
            : "Initiated and awaiting assignment",
  } : null;

  const projects = Array.from(
    new Set(activeRequests.map(r => r.project))
  );
  const filteredRequests =
    selectedProject === "ALL"
      ? activeRequests
      : activeRequests.filter(r => r.project === selectedProject);

  const activeCount = filteredRequests.filter(r => r.status !== "Completed").length;
  const completedCount = filteredRequests.filter(r => r.status === "Completed").length;

  const vieWorkflowProgress = role === "VIE"
    ? (() => {
        const relevant = filteredRequests.length > 0 ? filteredRequests : activeRequests;
        const statusOrder = ["Completed", "For Review", "In Progress", "Initiated", "Rejected"];
        const status = statusOrder.find(status => relevant.some(req => req.status === status)) ?? "Initiated";
        const currentOwner = status === "Completed"
          ? "Completed"
          : status === "For Review"
            ? "PCL"
            : status === "In Progress"
              ? "System Engineer"
              : status === "Rejected"
                ? "VIE"
                : "Vehicle Integration Engineer";

        return {
          status,
          percent: status === "Completed" ? 100 : status === "For Review" ? 75 : status === "In Progress" ? 55 : status === "Rejected" ? 20 : 30,
          currentOwner,
          pendingOn: status === "Completed"
            ? "Completed across all active workflows"
            : status === "For Review"
              ? "Awaiting final PCL review"
              : status === "In Progress"
                ? "With System Engineer for evaluation"
                : status === "Rejected"
                  ? "Returned to VIE for rework"
                  : "Waiting for gate assignment",
        };
      })()
    : null;

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Initiated": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50";
      case "In Progress": return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50";
      case "For Review": return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50";
      case "Completed": return "bg-green-50 text-green-700 border-green-200 hover:bg-green-50";
      case "Rejected":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-50";
      default: return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    }
  };

  const sortedRequests = useMemo(
    () => [...filteredRequests].sort((a, b) => a.project.localeCompare(b.project)),
    [filteredRequests]
  );

  const groupedRequests = useMemo(
    () =>
      sortedRequests.reduce<Record<string, typeof sortedRequests>>((acc, req) => {
        acc[req.project] = [...(acc[req.project] ?? []), req];
        return acc;
      }, {}),
    [sortedRequests]
  );

  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (role !== "VIE") return;

    setExpandedProjects(prev => {
      const next = { ...prev };
      let changed = false;

      Object.keys(groupedRequests).forEach(project => {
        if (next[project] === undefined) {
          next[project] = false;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [role, groupedRequests]);

  const toggleProject = (project: string) => {
    setExpandedProjects(prev => ({ ...prev, [project]: !prev[project] }));
  };

  if (selectedRequestId && selectedRequest) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => setSelectedRequestId(null)}>
             <ArrowLeft className="h-5 w-5" />
           </Button>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
               {selectedRequest.req_id}
               <Badge variant="outline" className="text-lg font-normal">Rev 01</Badge>
             </h1>
             <p className="text-muted-foreground mt-1">
               {selectedRequest.project} - {selectedRequest.variant}
             </p>
           </div>
        </div>

        {projectStageProgress && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Workflow Progress</CardTitle>
              <CardDescription>Current stage and pending handoff across the M2-M4 workflow.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Current Stage</span>
                  <Badge variant="outline">{projectStageProgress.stage}</Badge>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted">
                  <div className="h-2.5 rounded-full bg-primary" style={{ width: `${projectStageProgress.percent}%` }} />
                </div>
                <div className="text-sm text-muted-foreground">
                  Currently with: <span className="font-medium text-foreground">{projectStageProgress.currentOwner}</span>
                </div>
                <div className="text-sm text-muted-foreground">Pending on: {projectStageProgress.pendingOn}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {(isPCL || isCDM) && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{isPCL ? "Total Add Cost" : "ROCM Cost"}</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹ {selectedRequest.addCost.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{isPCL ? "Cost of new parts" : "Approved model cost"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{isPCL ? "Total Delete Cost" : "SBC Cost"}</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₹ {selectedRequest.deleteCost.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{isPCL ? "Cost of removed parts" : "Supplier base cost"}</p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">{isPCL ? "Total Impact" : "Estimation Cost"}</CardTitle>
                <IndianRupee className="h-4 w-4 text-primary"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₹ {(isPCL ? selectedRequest.addCost - selectedRequest.deleteCost : selectedRequest.totalCost).toLocaleString()}</div>
                <p className="text-xs text-primary/70">{isPCL ? "Change in cost" : "Projected investment value"}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isPM && (
          <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
            <CardHeader>
              <CardTitle>Project Manager Read-Only Summary</CardTitle>
              <CardDescription>Monitoring view for workflow progress, pending activities, and completion status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="rounded-md border bg-background p-3"><div className="text-muted-foreground">Stage</div><div className="mt-1 font-semibold">{selectedRequest.status}</div></div>
                <div className="rounded-md border bg-background p-3"><div className="text-muted-foreground">Pending Activities</div><div className="mt-1 font-semibold">{selectedRequest.pending.length || "None"}</div></div>
                <div className="rounded-md border bg-background p-3"><div className="text-muted-foreground">Completed Activities</div><div className="mt-1 font-semibold">{selectedRequest.completed.length}</div></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Placeholder for Detailed BOM Content Table */}
        <Card>
          <CardHeader>
            <CardTitle>Change Content Details</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Line item details for this change request.</span>

              {selectedRequest.status === "For Review" && !isPCL && (
                <div className="flex gap-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(selectedRequest.req_id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedRequest.req_id)}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

            </CardDescription>

          </CardHeader>
          <CardContent>
            <BOMTable data={bomDataByRequestId[selectedRequest.req_id] || []} role={role} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            M2 M4 Change Content Workflow Summary
          </h1>

          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Project:</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
        </div>


      {/* Replaced Charts with Workflow Counts */}
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Active Workflows</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{activeCount}</div>
              <p className="text-xs text-blue-600/80">Currently in progress</p>
            </CardContent>
         </Card>

         <Card className="bg-green-50/50 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Completed Workflows</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{completedCount}</div>
              <p className="text-xs text-green-600/80">Successfully closed</p>
            </CardContent>
         </Card>
      </div>

      {isPCL && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>PCL Project Dashboard</CardTitle>
            <CardDescription>Project-wise and system-wise comparison of cost delta across active workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border bg-background p-3"><div className="text-xs text-muted-foreground">Projects in Review</div><div className="mt-2 text-2xl font-bold">3</div></div>
              <div className="rounded-md border bg-background p-3"><div className="text-xs text-muted-foreground">Avg. Cost Delta</div><div className="mt-2 text-2xl font-bold">₹ 8,500</div></div>
              <div className="rounded-md border bg-background p-3"><div className="text-xs text-muted-foreground">Pending Cost Assessments</div><div className="mt-2 text-2xl font-bold">2</div></div>
            </div>
          </CardContent>
        </Card>
      )}

      {vieWorkflowProgress && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>VIE Workflow Progress</CardTitle>
            <CardDescription>Current stage ownership and pending handoff across the workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Current Stage</span>
              <Badge variant="outline">{vieWorkflowProgress.status}</Badge>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div className="h-2.5 rounded-full bg-primary" style={{ width: `${vieWorkflowProgress.percent}%` }} />
            </div>
            <div className="text-sm text-muted-foreground">
              Currently with: <span className="font-medium text-foreground">{vieWorkflowProgress.currentOwner}</span>
            </div>
            <div className="text-sm text-muted-foreground">Pending on: {vieWorkflowProgress.pendingOn}</div>
          </CardContent>
        </Card>
      )}

      {/* Active Workflow Status (Tabular Format) */}
      <Card>
        <CardHeader>
          <CardTitle>Active Change Workflows</CardTitle>
          <CardDescription>Real-time status of ongoing BOM change requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Project</TableHead>
                <TableHead className="w-[100px]">Proj Ver</TableHead>
                <TableHead className="w-[250px]">Variant</TableHead>
                <TableHead className="w-[90px]">Var Ver</TableHead>
                <TableHead className="w-[140px]">Request ID</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">Assigned To</TableHead>
                <TableHead className="w-[120px]">Assigned By</TableHead>
                <TableHead className="w-[120px]">Assigned Date</TableHead>
                <TableHead className="w-[140px]">Completed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {role === "VIE"
                ? Object.entries(groupedRequests).map(([project, projectRequests]) => {
                    const isExpanded = expandedProjects[project] ?? false;
                    const projectStatus = projectRequests.some(req => req.status === "Completed")
                      ? "Completed"
                      : projectRequests.some(req => req.status === "For Review")
                        ? "For Review"
                        : projectRequests.some(req => req.status === "In Progress")
                          ? "In Progress"
                          : "Initiated";

                    return (
                      <Fragment key={project}>
                        <TableRow
                          onClick={() => toggleProject(project)}
                          className="cursor-pointer bg-muted/10 hover:bg-muted/20"
                        >
                          <TableCell className="font-semibold">{project}</TableCell>
                          <TableCell className="text-xs">{projectRequests[0]?.project_version}</TableCell>
                          <TableCell className="text-sm font-medium text-muted-foreground">
                            {projectRequests.length} variant{projectRequests.length > 1 ? "s" : ""}
                          </TableCell>
                          <TableCell className="text-xs">—</TableCell>
                          <TableCell className="font-mono text-xs text-primary underline">Project Summary</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] ${getStatusColor(projectStatus)}`}>
                              {projectStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{projectRequests[0]?.assigned_to}</TableCell>
                          <TableCell className="text-xs">{projectRequests[0]?.assigned_by}</TableCell>
                          <TableCell className="text-xs">{projectRequests[0]?.assigned_date}</TableCell>
                          <TableCell className="text-xs">{projectRequests[0]?.completed_date ?? "—"}</TableCell>
                        </TableRow>

                        {isExpanded && projectRequests.map(req => (
                          <TableRow
                            key={req.req_id}
                            onClick={event => {
                              event.stopPropagation();
                              setSelectedRequestId(req.req_id);
                            }}
                            className="cursor-pointer hover:bg-muted/50 bg-background"
                          >
                            <TableCell className="pl-8 text-muted-foreground">↳ Variant</TableCell>
                            <TableCell className="text-xs">{req.project_version}</TableCell>
                            <TableCell className="text-muted-foreground">{req.variant}</TableCell>
                            <TableCell className="text-xs">{req.variant_version}</TableCell>
                            <TableCell className="font-mono text-xs text-primary underline">{req.req_id}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] ${getStatusColor(req.status)}`}>
                                {req.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{req.assigned_to}</TableCell>
                            <TableCell className="text-xs">{req.assigned_by}</TableCell>
                            <TableCell className="text-xs">{req.assigned_date}</TableCell>
                            <TableCell className="text-xs">{req.completed_date ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    );
                  })
                : sortedRequests.map((req) => (
                    <TableRow
                      key={req.req_id}
                      onClick={() => setSelectedRequestId(req.req_id)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{req.project}</TableCell>
                      <TableCell className="text-xs">{req.project_version}</TableCell>
                      <TableCell className="text-muted-foreground">{req.variant}</TableCell>
                      <TableCell className="text-xs">{req.variant_version}</TableCell>
                      <TableCell className="font-mono text-xs text-primary underline">{req.req_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${getStatusColor(req.status)}`}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{req.assigned_to}</TableCell>
                      <TableCell className="text-xs">{req.assigned_by}</TableCell>
                      <TableCell className="text-xs">{req.assigned_date}</TableCell>
                      <TableCell className="text-xs">{req.completed_date ?? "—"}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
