import { usePendingBusinesses, usePendingApprovalRequests, useUpdateBusiness, useUpdateApprovalRequest } from "../../hooks/useBusinesses";
import { Button } from "../ui/button";
import { Check, X, Loader2, Building2, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export function PendingApprovals() {
  // Try both sources: direct businesses with pending status AND approval_requests table
  const { data: pendingBusinesses, isLoading: loadingBusinesses } = usePendingBusinesses();
  const { data: approvalRequests, isLoading: loadingRequests } = usePendingApprovalRequests();
  const updateBusiness = useUpdateBusiness();
  const updateApprovalRequest = useUpdateApprovalRequest();

  const isLoading = loadingBusinesses || loadingRequests;

  // Handle approval from business_approval_requests table
  const handleApproveRequest = async (requestId: string, businessId: string, name: string) => {
    try {
      await updateApprovalRequest.mutateAsync({
        requestId,
        businessId,
        status: "approved"
      });
      toast.success(`${name} ha sido aprobado y publicado`);
    } catch (err) {
      console.error("Error approving:", err);
      toast.error("Error al aprobar el establecimiento");
    }
  };

  const handleRejectRequest = async (requestId: string, businessId: string, name: string) => {
    try {
      await updateApprovalRequest.mutateAsync({
        requestId,
        businessId,
        status: "rejected",
        rejectionReason: "Solicitud rechazada por el administrador"
      });
      toast.success(`${name} ha sido rechazado`);
    } catch (err) {
      console.error("Error rejecting:", err);
      toast.error("Error al rechazar el establecimiento");
    }
  };

  // Handle direct business approval (fallback)
  const handleApproveDirect = async (id: string, name: string) => {
    try {
      await updateBusiness.mutateAsync({
        id,
        updates: { 
          approval_status: "approved",
          onboarding_completed: true, 
          is_active: true, 
          is_public: true 
        }
      });
      toast.success(`${name} ha sido aprobado y publicado`);
    } catch (err) {
      console.error("Error approving:", err);
      toast.error("Error al aprobar el establecimiento");
    }
  };

  const handleRejectDirect = async (id: string, name: string) => {
    try {
      await updateBusiness.mutateAsync({
        id,
        updates: { 
          approval_status: "rejected",
          is_active: false,
          is_public: false
        }
      });
      toast.success(`${name} ha sido rechazado`);
    } catch (err) {
      console.error("Error rejecting:", err);
      toast.error("Error al rechazar el establecimiento");
    }
  };

  if (isLoading) {
    return (
      <div className="card-elevated p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Aprobaciones pendientes</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Combine both sources, prioritizing approval_requests
  const requestBusinessIds = new Set(approvalRequests?.map(r => r.business_id) || []);
  const directPending = pendingBusinesses?.filter(b => !requestBusinessIds.has(b.id)) || [];
  
  const totalPending = (approvalRequests?.length || 0) + directPending.length;
  
  // Debug logging
  console.log("PendingApprovals Debug:", {
    approvalRequestsCount: approvalRequests?.length || 0,
    pendingBusinessesCount: pendingBusinesses?.length || 0,
    directPendingCount: directPending.length,
    totalPending,
    approvalRequests: approvalRequests,
    pendingBusinesses: pendingBusinesses,
  });

  return (
    <div className="card-elevated">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Aprobaciones pendientes</h3>
        {totalPending > 0 && (
          <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded">
            {totalPending} pendiente{totalPending !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {totalPending === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <Check className="h-5 w-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">No hay solicitudes pendientes</p>
          </div>
        ) : (
          <>
            {/* Render approval requests first */}
            {approvalRequests?.map((request) => {
              const biz = request.business;
              return (
                <div key={request.id} className="p-4 table-row-hover">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-warning" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {biz?.business_name || "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {biz?.primary_category || biz?.category || "Sin categoría"}
                        </p>
                        {request.submitted_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Enviado {format(new Date(request.submitted_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        )}
                        {request.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">
                            "{request.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleApproveRequest(request.id, request.business_id, biz?.business_name || "Negocio")}
                        disabled={updateApprovalRequest.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRejectRequest(request.id, request.business_id, biz?.business_name || "Negocio")}
                        disabled={updateApprovalRequest.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Render direct pending businesses */}
            {directPending.map((biz) => (
              <div key={biz.id} className="p-4 table-row-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {biz.business_name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {biz.primary_category || biz.category || "Sin categoría"}
                      </p>
                      {biz.created_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Registrado {formatDistanceToNow(new Date(biz.created_at), { addSuffix: true, locale: es })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
                      onClick={() => handleApproveDirect(biz.id, biz.business_name || "Negocio")}
                      disabled={updateBusiness.isPending}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRejectDirect(biz.id, biz.business_name || "Negocio")}
                      disabled={updateBusiness.isPending}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}








