import { createContext, useContext } from "react";

export type Role = "VIE" | "SE" | "PCL" | "CDM" | "PM";

export type RoleContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

export const RoleContext = createContext<RoleContextType | undefined>(
  undefined
);

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error(
      "useRole must be used within a RoleContext.Provider"
    );
  }

  return context;
}
