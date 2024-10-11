"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "~/lib/site";
import { navsConfig } from "~/lib/navs";
import { cn } from "~/lib/utils";
import Icons from "~/app/_components/ui/icons";

export default function MainNav() {
  const pathName = usePathname();
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.Logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {navsConfig.mainNav.map((item) => (
          <Link
            key={item.title}
            href={item.href ?? "/"}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathName === item.href ? "text-foreground" : "text-foreground/60",
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
