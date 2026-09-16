import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileInput,
  PlusCircle,
  Menu,
  UserCircle2,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleContext, useRole } from "@/components/RoleContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { role, setRole } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    {
      name: "Initiate Change Content",
      href: "/initiate-change-content",
      icon: FileInput,
      roles: ["VIE"],
    },
    {
      name: "Add Change Content",
      href: "/add-change-content",
      icon: PlusCircle,
      roles: ["SE"],
    },
    {
      name: "View Change Content",
      href: "/view-change-content",
      icon: LayoutDashboard,
      roles: ["VIE", "SE", "PCL", "CDM", "PM"],
    },
  ];

  const roleLabel = {
    VIE: "Vehicle Integration Engineer",
    SE: "System Engineer",
    PCL: "PCL",
    CDM: "CDM",
    PM: "Project Manager",
  };

  const roleEmail = {
    VIE: "vie@mahindra.com",
    SE: "se@mahindra.com",
    PCL: "pcl@mahindra.com",
    CDM: "cdm@mahindra.com",
    PM: "pm@mahindra.com",
  };

  const visibleNavigation = navigation.filter(item =>
    item.roles.includes(role)
  );

  useEffect(() => {
    const isAllowed = visibleNavigation.some(item => item.href === location);
    if (!isAllowed && visibleNavigation.length > 0) {
      setLocation(visibleNavigation[0].href);
    }
  }, [location, visibleNavigation, setLocation]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r bg-sidebar fixed h-full z-30 transition-all duration-300",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Logo */}
          <div className="p-4 flex items-center gap-2 border-b h-16">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
              M
            </div>
            {!collapsed && (
              <span className="font-bold text-lg truncate">
                M2 M4 Change
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {visibleNavigation.map(item => (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    location === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.name}
                </div>
              </Link>
            ))}
          </nav>

          {/* Footer / Role */}
          <div className="p-3 border-t">
            {!collapsed && (
              <>
                <p className="text-sm font-medium truncate">
                  {roleLabel[role]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {roleEmail[role]}
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 mt-2"
                    >
                      Switch Role (Demo)
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRole("VIE")}>
                      Vehicle Integration Engineer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("SE")}>
                      System Engineer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("PCL")}>
                      PCL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("CDM")}>
                      CDM
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("PM")}>
                      Project Manager
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </aside>

        {/* Main Area */}
        <div
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            collapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          {/* Header */}
          <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="flex items-center gap-2">
              {/* Desktop collapse toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                onClick={() => setCollapsed(v => !v)}
              >
                <ChevronLeft
                  className={cn(
                    "h-5 w-5 transition-transform",
                    collapsed && "rotate-180"
                  )}
                />
              </Button>

              {/* Mobile menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="p-6 border-b font-bold">
                      M2 M4 Change
                    </div>
                    <nav className="p-4 space-y-2">
                      {visibleNavigation.map(item => (
                        <Link key={item.name} href={item.href}>
                          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm">
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </div>
                        </Link>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle2 className="h-6 w-6" />
            </Button>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleContext.Provider>
  );
}
