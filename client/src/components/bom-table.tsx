
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

  outgoingPartNo?: string | null;
  outgoingRevision?: string | null;
  outgoingDesc?: string | null;
  outgoingQtyPerVehicle?: number | null;
  outgoingVehicleEndItem?: string | null;
  outgoingCost?: number | null;

  status: "Add" | "Delete" | "Modify";
  remarks?: string;
}



interface BOMTableProps {
  data: BOMItem[];
  role: string;
}

export function BOMTable({ data,role }: BOMTableProps) {
  const showCost = role === "PCL";
  const showAction = showCost || role === "SE";
  // Flatten the tree for rendering, respecting expansion state
  // This is a simple flat list render for now, but we visually indent
  // In a real app we might do recursive rendering or smart flattening
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50px] text-center border-r">Lvl</TableHead>
            <TableHead className="w-[160px] border-r">System</TableHead>

            <TableHead
              colSpan={showCost ? 7 : 6}
              className="text-center bg-red-50/50 text-red-900 border-r"
            >
              Outgoing Model
            </TableHead>

            <TableHead
              colSpan={showCost ? 7 : 6}
              className="text-center bg-green-50/50 text-green-900 border-r"
            >
              Incoming Model
            </TableHead>

            <TableHead className="w-[180px]">Remarks</TableHead>
            {showAction && <TableHead className="w-[90px] text-right">Actions</TableHead>}
          </TableRow>

          <TableRow className="bg-muted/30 text-xs">
            <TableHead className="border-r" />
            <TableHead className="border-r" />

            {/* Outgoing */}
            <TableHead className="text-center border-r text-red-700">DEL</TableHead>
            <TableHead className="border-r">Part No</TableHead>
            <TableHead className="border-r">Rev</TableHead>
            <TableHead className="border-r">Description</TableHead>
            <TableHead className="border-r text-center">Qty</TableHead>
            <TableHead className="border-r">End Item</TableHead>
            {showCost && (
              <TableHead className="border-r text-right">Cost</TableHead>
            )}


            {/* Incoming */}
            <TableHead className="text-center border-r text-green-700">ADD</TableHead>
            <TableHead className="border-r">Part No</TableHead>
            <TableHead className="border-r">Rev</TableHead>
            <TableHead className="border-r">Description</TableHead>
            <TableHead className="border-r text-center">Qty</TableHead>
            <TableHead className="border-r">End Item</TableHead>
            {showCost && (
              <TableHead className="border-r text-right">Cost</TableHead>
            )}


            <TableHead />
            <TableHead />
          </TableRow>

        </TableHeader>
       <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="group hover:bg-muted/30">
              {/* Level */}
              <TableCell className="text-center font-mono text-xs border-r">
                {row.level}
              </TableCell>

              {/* System */}
              <TableCell className="border-r">
                <div
                  className="truncate text-xs font-medium"
                  style={{ paddingLeft: `${(row.level - 1) * 1.25}rem` }}
                >
                  {row.system}
                </div>
              </TableCell>

              {/* OUTGOING */}
              <TableCell className="text-center text-xs font-bold text-red-600 border-r">
                {(row.status === "Delete" || row.status === "Modify") && row.outgoingPartNo
                  ? "DEL"
                  : ""}
              </TableCell>

              <TableCell className="font-mono text-xs truncate max-w-[180px] border-r">
                {row.outgoingPartNo || "-"}
              </TableCell>

              <TableCell className="text-xs border-r">
                {row.outgoingRevision || "-"}
              </TableCell>

              <TableCell className="text-xs truncate max-w-[180px] border-r" title={row.outgoingDesc ?? ""}>
                {row.outgoingDesc || "-"}
              </TableCell>

              <TableCell className="text-xs text-center border-r">
                {row.outgoingQtyPerVehicle ?? "-"}
              </TableCell>

              <TableCell className="text-xs border-r">
                {row.outgoingVehicleEndItem || "-"}
              </TableCell>

              {showCost && (
                <TableCell className="text-xs text-right border-r">
                  {row.outgoingCost ? `₹${row.outgoingCost.toLocaleString()}` : "-"}
                </TableCell>
              )}


              {/* INCOMING */}
              <TableCell className="text-center text-xs font-bold text-green-600 border-r">
                {(row.status === "Add" || row.status === "Modify") && row.incomingPartNo
                  ? "ADD"
                  : ""}
              </TableCell>

              <TableCell className="font-mono text-xs truncate max-w-[180px] border-r">
                {row.incomingPartNo || "-"}
              </TableCell>

              <TableCell className="text-xs border-r">
                {row.incomingRevision || "-"}
              </TableCell>

              <TableCell className="text-xs truncate max-w-[180px] border-r" title={row.incomingDesc ?? ""}>
                {row.incomingDesc || "-"}
              </TableCell>

              <TableCell className="text-xs text-center border-r">
                {row.incomingQtyPerVehicle ?? "-"}
              </TableCell>

              <TableCell className="text-xs border-r">
                {row.incomingVehicleEndItem || "-"}
              </TableCell>

             {showCost && (
                <TableCell className="text-xs text-right border-r">
                  {row.incomingCost ? `₹${row.incomingCost.toLocaleString()}` : "-"}
                </TableCell>
              )}


              {/* Remarks */}
              <TableCell className="text-xs truncate max-w-[180px]">
                {row.remarks || <span className="italic opacity-40">No remarks</span>}
              </TableCell>

              {/* Actions */}
              {showAction && <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>}
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </div>
  );
}
