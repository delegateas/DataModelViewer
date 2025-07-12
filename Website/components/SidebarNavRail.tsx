import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Info, Database, PencilRuler } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Metadata Viewer",
    icon: <Database />,
    href: "/",
    active: true,
    disabled: false,
  },
  {
    label: "Diagram Viewer",
    icon: <PencilRuler />,
    href: "/diagram",
    active: false,
    disabled: false,
  },
];

export default function SidebarNavRail() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col items-center justify-between h-full min-w-14 bg-white border-r border-sidebar-border py-2"
      aria-label="Main navigation"
    >
      {/* Nav Items */}
      <div className="flex flex-col gap-2 flex-1 items-center mt-4">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={pathname === item.href ? "secondary" : "ghost"}
            size="icon"
            aria-label={item.label}
            disabled={item.disabled}
            className={`mb-1 ${pathname === item.href ? "bg-blue-100 text-blue-900" : ""}`}
            onClick={() => {
              if (!item.disabled && item.href !== "#") router.push(item.href);
            }}
          >
            {item.icon}
          </Button>
        ))}
      </div>
      <div className="flex flex-col items-center mb-2">
        {/* About */}
        <Button
          variant={pathname === "/about" ? "secondary" : "ghost"}
          size="icon"
          aria-label={"About"}
          className={`mb-1 ${pathname === "/about" ? "bg-blue-100 text-blue-900" : ""}`}
          onClick={() => { router.push("/about"); }}
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