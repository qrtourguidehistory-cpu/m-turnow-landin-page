import AdminLayout from "../AdminLayout";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 h-full flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {description}
            </p>
          </div>
          <p className="text-sm text-primary">En desarrollo...</p>
        </div>
      </div>
    </AdminLayout>
  );
}








