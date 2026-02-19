
import { useState, useEffect } from 'react';
import { InspectorHeader } from './InspectorHeader';
import { VenueSelectionForm } from './VenueSelectionForm';
import { ClientSelectionForm } from './ClientSelectionForm';
import { ProductSelectorInspection } from './ProductSelectorInspection';
import { InspectionForm } from './InspectionForm';
import { InspectionHistory } from './InspectionHistory';
import { DebugPanel } from './DebugPanel';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInspections, createInspection, getUserRole } from '../utils/api-direct'; // ✅ Usar API directa
import { supabase } from '../utils/supabase/client';
import { calculateGlobalScore, calculateVenueStatus } from '../utils/scoreCalculations';

interface InspectorDashboardProps {
  session: any;
}

export function InspectorDashboard({ session }: InspectorDashboardProps) {
  const [currentView, setCurrentView] = useState<'new' | 'history'>('new');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // const accessToken = session.access_token;

  // Load inspections on mount
  useEffect(() => {
    loadInspections();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  const loadInspections = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      console.log('🔄 [Inspector Dashboard] Loading inspections via Direct API...');
      const data = await getInspections(); // ✅ Usar API directa
      setInspections(data);
      console.log('✅ [Inspector Dashboard] Loaded', data.length, 'inspections');
    } catch (error: any) {
      console.error('❌ [Inspector Dashboard] Error loading inspections:', error);

      // Check if it's an authentication error
      if (error.message?.includes('autenticado') || error.message?.includes('sesión')) {
        setAuthError('Tu sesión ha expirado. Por favor cierra sesión e inicia sesión nuevamente.');
      } else {
        setAuthError(error.message || 'Error al cargar las inspecciones');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSelect = (venue: any) => {
    setSelectedVenue(venue);
  };

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
  };

  const handleBackToVenue = () => {
    setSelectedVenue(null);
    setSelectedClient(null);
    setSelectedProduct(null);
  }

  const handleBackToClient = () => {
    setSelectedClient(null);
    setSelectedProduct(null);
  }

  const handleBackToProductSelection = () => {
    setSelectedProduct(null);
  };

  const handleSubmitInspection = async (data: any) => {
    try {
      if (!selectedVenue || !selectedProduct) return;

      console.log('📤 Submitting inspection...', data);

      // Calculate Global Score
      const scores = calculateGlobalScore({
        staffKnowledge: data.staffKnowledge,
        certifiedBartenders: data.certifiedBartenders,
        totalBartenders: data.totalBartenders,
        brandAdvocacy: data.brandAdvocacy,
        backBarVisibility: data.backBarVisibility,
        shelfPosition: data.shelfPosition,
        tiene_material_pop: data.backBarSignage !== 'missing' || (data.pos_materials && data.pos_materials.length > 0),
        pos_materials: data.pos_materials,
        stockLevel: data.stockLevel
      });

      const venueStatus = calculateVenueStatus(scores.globalScore);

      // Crear objeto de inspección (Modelo 1:1)
      const inspectionData = {
        punto_venta_id: selectedVenue.id,
        producto_id: selectedProduct.id,
        usuario_id: session.user.id,
        fecha_inspeccion: new Date().toISOString(),

        // Datos del Producto
        tiene_producto: data.brandOnMenu || data.brand_present || false,
        stock_nivel: data.stockLevel || 'adequate',

        // Material POP
        tiene_material_pop: (data.backBarSignage !== 'missing' && data.backBarSignage !== 'not-applicable') ||
          (data.pos_materials && data.pos_materials.length > 0) || false,
        material_pop_detalle: data.pos_materials ? JSON.stringify(data.pos_materials) : null,
        material_pop_tipos: data.pos_materials || [],

        // Otros datos
        temperatura_refrigeracion: data.temperature || null,
        observaciones: `${data.notes || ''}${data.recommendedActions ? `\n\n[RECOMENDACIONES]\n${data.recommendedActions}` : ''} `.trim(),
        fotos_urls: data.photos || [],

        // Full Details for History (now including score breakdown)
        detalles: {
          ...data,
          scoreBreakdown: scores.breakdown,
          venueStatus: venueStatus
        },

        // Global Score
        global_score: scores.globalScore, // New column
        visibilidad_score: scores.globalScore, // Keeping this for backward compatibility if used elsewhere
        compliance_score: scores.globalScore, // Keeping this but treating global_score as primary

        precio_venta: 0, // Default
        en_promocion: false,
      };

      await createInspection(inspectionData as any);

      // Update Venue Segment/Status + Score
      const { error: venueError } = await supabase
        .from('btl_puntos_venta')
        .update({
          segmento: venueStatus.label, // "Estratégico", "Oportunidad", "Riesgo"
          global_score: scores.globalScore, // Saving score on venue as requested
          last_inspection_date: new Date().toISOString()
        })
        .eq('id', selectedVenue.id);

      if (venueError) {
        console.error('Error updating venue status:', venueError);
        // We don't block the flow, but log it
      }

      console.log('✅ [Inspector Dashboard] Inspection created successfully with Score:', scores.globalScore);
      toast.success('Inspección Enviada', {
        description: `Score Global: ${scores.globalScore} (${venueStatus.label})`
      });

      // Reload inspections
      await loadInspections();

      setSelectedVenue(null);
      setSelectedClient(null);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('❌ [Inspector Dashboard] Error submitting inspection:', error);
      toast.error('Error al enviar la inspección', {
        description: error.message || 'Por favor intenta de nuevo.'
      });
    }
  };

  // Handle forced logout when auth fails
  const handleForceLogout = async () => {
    console.log('🔄 Forcing logout due to auth error...');
    await supabase.auth.signOut();
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
    // Reload to login page
    window.location.href = '/?mode=inspector';
  };

  return (
    <>
      <InspectorHeader
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 pb-20">
        {loading && currentView === 'history' ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : currentView === 'new' ? (
          <>
            {!selectedVenue ? (
              <VenueSelectionForm onVenueSelect={handleVenueSelect} />
            ) : !selectedClient ? (
              <ClientSelectionForm
                onClientSelect={handleClientSelect}
                onBack={handleBackToVenue}
              />
            ) : !selectedProduct ? (
              <ProductSelectorInspection
                venue={selectedVenue}
                clientId={selectedClient.id}
                onBack={handleBackToClient}
                onProductSelect={handleProductSelect}
              />
            ) : (
              <InspectionForm
                venue={selectedVenue}
                product={selectedProduct}
                onBack={handleBackToProductSelection}
                onSubmit={handleSubmitInspection}
              />
            )}
          </>
        ) : (
          <InspectionHistory
            inspections={inspections}
            onRefresh={loadInspections}
            onBack={() => setCurrentView('new')}
            userRole={userRole}
          />
        )}
      </main>

      {/* Authentication Error Toast */}
      {authError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md animate-in slide-in-from-top">
          <div className="bg-red-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Error de Autenticación</div>
                <div className="text-sm opacity-90 mb-3">{authError}</div>
                <button
                  onClick={handleForceLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cerrar Sesión e Ingresar Nuevamente
                </button>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="flex-shrink-0 text-white/70 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel session={session} />
    </>
  );
}