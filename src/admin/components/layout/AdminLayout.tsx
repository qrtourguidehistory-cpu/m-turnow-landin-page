import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 space-y-6">
            {(title || description) && (
              <div className="space-y-1">
                {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}








