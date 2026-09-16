
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Pencil, Trash2, MessageSquare } from "lucide-react";
import { useState } from "react";

export interface BOMItem {
  id: string;
  level: number;
  system: string;

  incomingPartNo?: string | null;
  incomingRevision?: string | null;
  incomingDesc?: string | null;
  incomingQtyPerVehicle?: number | null;
  incomingVehicleEndItem?: string | null;
  incomingCost?: number | null;
  rocmCost?: number | null;
  sbcCost?: number | null;
  estimationCost?: number | null;
  investmentAmount?: number | null;

  outgoingPartNo?: string | null;
  outgoingRevision?: string | null;
  outgoingDesc?: string | null;
  outgoingQtyPerVehicle?: number | null;
  outgoingVehicleEndItem?: string | null;
  outgoingCost?: number | null;
  initialCost?: number | null;
  updatedCost?: number | null;

  status: "Add" | "Delete" | "Modify";
  remarks?: string;
  pclRemarks?: string;
}



interface BOMTableProps {
  data: BOMItem[];
  role: string;
}

export function BOMTable({ data,role }: BOMTableProps) {
  const showCost = role === "PCL" || role === "CDM";
  const showAction = showCost || role === "SE";
  const isCDM = role === "CDM";
  const isPCL = role === "PCL";

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50px] text-center border-r">Lvl</TableHead>
            <TableHead className="w-[160px] border-r">System</TableHead>

            <TableHead
              colSpan={showCost ? 8 : 6}
              className="text-center bg-red-50/50 text-red-900 border-r"
            >
              Outgoing Model
            </TableHead>

            <TableHead
              colSpan={showCost ? 9 : 6}
              className="text-center bg-green-50/50 text-green-900 border-r"
            >
              Incoming Model
            </TableHead>

            <TableHead className="w-[180px]">{isPCL ? "PCL Remarks" : "Remarks"}</TableHead>
            {showAction && <TableHead className="w-[90px] text-right">Actions</TableHead>}
          </TableRow>

          <TableRow className="bg-muted/30 text-xs">
            <TableHead className="border-r" />
            <TableHead className="border-r" />

            <TableHead className="text-center border-r text-red-700">DEL</TableHead>
            <TableHead className="border-r">Part No</TableHead>
            <TableHead className="border-r">Rev</TableHead>
            <TableHead className="border-r">Description</TableHead>
            <TableHead className="border-r text-center">Qty</TableHead>
            <TableHead className="border-r">End Item</TableHead>
            {showCost && (
              <TableHead className="border-r text-right">{isPCL ? "Initial Cost" : "ROCM Cost"}</TableHead>
            )}
            {showCost && (
              <TableHead className="border-r text-right">{isPCL ? "Updated Cost" : "SBC Cost"}</TableHead>
            )}

            <TableHead className="text-center border-r text-green-700">ADD</TableHead>
            <TableHead className="border-r">Part No</TableHead>
            <TableHead className="border-r">Rev</TableHead>
            <TableHead className="border-r">Description</TableHead>
            <TableHead className="border-r text-center">Qty</TableHead>
            <TableHead className="border-r">End Item</TableHead>
            {showCost && (
              <TableHead className="border-r text-right">{isPCL ? "Cost" : "Estimation Cost"}</TableHead>
            )}
            {showCost && (
              <TableHead className="border-r text-right">{isCDM ? "Investment" : "Total"}</TableHead>
            )}

            <TableHead />
            <TableHead />
          </TableRow>

        </TableHeader>
       <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="group hover:bg-muted/30">
              <TableCell className="text-center font-mono text-xs border-r">{row.level}</TableCell>
              <TableCell className="border-r">
                <div className="truncate text-xs font-medium" style={{ paddingLeft: `${(row.level - 1) * 1.25}rem` }}>
                  {row.system}
                </div>
              </TableCell>

              <TableCell className="text-center text-xs font-bold text-red-600 border-r">{(row.status === "Delete" || row.status === "Modify") && row.outgoingPartNo ? "DEL" : ""}</TableCell>
              <TableCell className="font-mono text-xs truncate max-w-[180px] border-r">{row.outgoingPartNo || "-"}</TableCell>
              <TableCell className="text-xs border-r">{row.outgoingRevision || "-"}</TableCell>
              <TableCell className="text-xs truncate max-w-[180px] border-r" title={row.outgoingDesc ?? ""}>{row.outgoingDesc || "-"}</TableCell>
              <TableCell className="text-xs text-center border-r">{row.outgoingQtyPerVehicle ?? "-"}</TableCell>
              <TableCell className="text-xs border-r">{row.outgoingVehicleEndItem || "-"}</TableCell>
              {showCost && (
                <TableCell className="text-xs text-right border-r">{(row.initialCost ?? row.outgoingCost) ? `₹${(row.initialCost ?? row.outgoingCost ?? 0).toLocaleString()}` : "-"}</TableCell>
              )}
              {showCost && (
                <TableCell className="text-xs text-right border-r">{(row.updatedCost ?? row.outgoingCost) ? `₹${(row.updatedCost ?? row.outgoingCost ?? 0).toLocaleString()}` : "-"}</TableCell>
              )}

              <TableCell className="text-center text-xs font-bold text-green-600 border-r">{(row.status === "Add" || row.status === "Modify") && row.incomingPartNo ? "ADD" : ""}</TableCell>
              <TableCell className="font-mono text-xs truncate max-w-[180px] border-r">{row.incomingPartNo || "-"}</TableCell>
              <TableCell className="text-xs border-r">{row.incomingRevision || "-"}</TableCell>
              <TableCell className="text-xs truncate max-w-[180px] border-r" title={row.incomingDesc ?? ""}>{row.incomingDesc || "-"}</TableCell>
              <TableCell className="text-xs text-center border-r">{row.incomingQtyPerVehicle ?? "-"}</TableCell>
              <TableCell className="text-xs border-r">{row.incomingVehicleEndItem || "-"}</TableCell>
              {showCost && (
                <TableCell className="text-xs text-right border-r">{(row.incomingCost ?? row.rocmCost ?? row.sbcCost) ? `₹${(row.incomingCost ?? row.rocmCost ?? row.sbcCost ?? 0).toLocaleString()}` : "-"}</TableCell>
              )}
              {showCost && (
                <TableCell className="text-xs text-right border-r">{(row.investmentAmount ?? row.estimationCost ?? row.sbcCost) ? `₹${(row.investmentAmount ?? row.estimationCost ?? row.sbcCost ?? 0).toLocaleString()}` : "-"}</TableCell>
              )}

              <TableCell className="text-xs truncate max-w-[180px]">
                {(isPCL ? row.pclRemarks : row.remarks) || <span className="italic opacity-40">No remarks</span>}
              </TableCell>

              {showAction && <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6"><MessageSquare className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </TableCell>}
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </div>
  );
}
