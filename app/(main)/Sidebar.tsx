import { getServerSession } from "@/lib/get-session";
import Link from "next/link";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";

import { SignOutButton } from "./SignOut";
import { CategoryList } from "@/components/category-list";
import { ActiveLink } from "@/components/active-link"; 
import SidebarClient from "@/components/SidebarClient";

export async function SidebarUI() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <SidebarClient>
      {/* Header / User Profile */}
      <div className="p-6 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          {user.image ? (
            <div className="relative h-12 w-12 rounded-full border-2 border-primary/20 overflow-hidden">
              <Image
                src={user.image}
                alt={user.name || "User"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground truncate">
              {user.name}
            </p>
            <Link
              href="/profile"
              className="text-xs text-muted-foreground hover:text-primary transition-colors block mt-0.5"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <ActiveLink href="/all-tasks">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <span className="font-medium">All Tasks</span>
          </ActiveLink>
        </div>

        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Categories
          </p>
          <CategoryList />
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/10">
        <SignOutButton />
      </div>
    </SidebarClient>
  );
}