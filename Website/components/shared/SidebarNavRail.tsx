import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Info, Database, PencilRuler, PlugZap, Sparkles, Home, ChartPie, Target } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useSidebarDispatch } from "@/contexts/SidebarContext";
import { Tooltip, TooltipContent } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

const navItems = [
  {
    label: "Home",
    icon: <Home />,
    href: "/",
    active: true,
    disabled: false,
    new: true,
  },
  {
    label: "Solution Overview",
    icon: <Target />,
    href: "/solution-overview",
    active: false,
    disabled: false,
    new: true,
  },
  {
    label: "Insight viewer",
    icon: <ChartPie />,
    href: "/insight",
    active: false,
    disabled: true,
    new: false,
  },
  {
    label: "Metadata viewer",
    icon: <Database />,
    href: "/metadata",
    active: false,
    disabled: false,
    new: false,
  },
  {
    label: "Diagram viewer",
    icon: <PencilRuler />,
    href: "/diagram",
    active: false,
    disabled: false,
    new: false,
  },
  {
    label: "Process viewer",
    icon: <PlugZap />,
    href: "/process",
    active: false,
    disabled: true,
    new: false,
  },
];

export default function SidebarNavRail() {
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useSidebarDispatch();

  return (
    <nav
      className="flex flex-col items-center justify-between h-full min-w-14 bg-white border-r border-sidebar-border py-2"
      aria-label="Main navigation"
    >
      {/* Nav Items */}
      <div className="flex flex-col gap-2 flex-1 items-center mt-4">
        {navItems.map((item) => (
          <div key={item.label} className="relative">
            <Tooltip>
              <TooltipContent side="left" className="max-w-xs">
                  <p className="text-sm">{item.label}</p>
              </TooltipContent>
              <TooltipTrigger>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="icon"
                  aria-label={item.label}
                  disabled={item.disabled}
                  className={`mb-1 ${pathname === item.href ? "bg-blue-100 text-blue-900" : ""}`}
                  onClick={() => {
                    if (!item.disabled && item.href !== "#"){ router.push(item.href); } 
                  }}
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
            </Tooltip>
            {item.new && (
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-4 h-4 text-blue-500 fill-blue-500" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center mb-2">
        {/* About */}
        <Button
          variant={pathname === "/about" ? "secondary" : "ghost"}
          size="icon"
          aria-label={"About"}
          className={`mb-1 ${pathname === "/about" ? "bg-blue-100 text-blue-900" : ""}`}
          onClick={() => { dispatch({ type: 'SET_SHOW_ELEMENT', payload: false }); router.push("/about"); }}
        >
          <Info />
        </Button>
        {/* Sign Out */}
        <form action="/api/auth/logout" method="post">
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            className="text-destructive"
          >
            <LogOut />
          </Button>
        </form>
      </div>
    </nav>
  );
} 