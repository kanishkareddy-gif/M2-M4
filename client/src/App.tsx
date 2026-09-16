import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import { RoleContext, Role } from "@/components/RoleContext";
import { useState } from "react";

// Pages
import InitiateChange from "@/pages/initiate-change";
import AddChange from "@/pages/add-change";
import ViewChangeContent from "@/pages/view-change-content";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/view-change-content" />} />
        <Route path="/initiate-change-content" component={InitiateChange} />
        <Route path="/add-change-content" component={AddChange} />
        <Route path="/view-change-content" component={ViewChangeContent} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [role, setRole] = useState<Role>("VIE");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleContext.Provider value={{ role, setRole }}>
          <Toaster />
          <Router />
        </RoleContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
