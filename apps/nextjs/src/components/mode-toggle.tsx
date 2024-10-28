"use client";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenuButton } from "./ui/sidebar";

export default function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton asChild size="sm">
          <div>
            <div className="absolute flex scale-0 items-center dark:scale-100">
              <MoonIcon className="rotate-90 transition-all dark:rotate-0" />
              <span className="rotate-90 scale-0 pl-2 transition-all dark:rotate-0 dark:scale-100">
                Dark Theme
              </span>
            </div>
            <div className="absolute flex scale-100 items-center dark:scale-0">
              <SunIcon className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <span className="rotate-0 scale-100 pl-2 transition-all dark:-rotate-90 dark:scale-0">
                Light Theme
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
