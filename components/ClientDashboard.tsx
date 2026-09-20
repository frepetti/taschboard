import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { ManagerDashboard } from './ManagerDashboard';
import { MessageSquarePlus, Package } from 'lucide-react';
import { TicketModal } from './TicketModal';
import { ProductMetrics } from './ProductMetrics';
import { VenueTrainingAnalytics } from './VenueTrainingAnalytics';
import { LoadingSpinner } from './LoadingSpinner';

interface Product {
  id: string;
  nombre: string;
  marca: string;
}

interface ClientDashboardProps {
  session: any;
  isDemo?: boolean;
  isAdmin?: boolean;
}

export function ClientDashboard({ session, isDemo = false, isAdmin = false }: ClientDashboardProps) {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showProductMetrics, _setShowProductMetrics] = useState(true);

  // Shared State for Filters (Lifted from ManagerDashboard)
  const [dateFilter, setDateFilter] = useState('6M');
  const [regionFilter, setRegionFilter] = useState('all');

  // Lifted Product State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(!isDemo);

  useEffect(() => {
    loadProducts();
  }, [isAdmin, isDemo]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      if (isDemo) {
        setProducts([]);
        setSelectedProductId('all');
        setLoadingProducts(false);
        return;
      }

      if (isAdmin) {
        // Admin: load ALL active products
        const { data: productsData, error } = await supabase
          .from('btl_productos')
          .select('id, nombre, marca')
          .eq('activo', true)
          .order('marca', { ascending: true });

        if (error) throw error;

        if (productsData && productsData.length > 0) {
          setProducts(productsData as any);
          setSelectedProductId((productsData[0] as any).id);
        } else {
          setProducts([]);
          setSelectedProductId(null);
        }
      } else {
        // Client: load only assigned products
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingProducts(false);
          return;
        }

        const { data: btlUser } = await supabase
          .from('btl_usuarios')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!btlUser) {
          setLoadingProducts(false);
          return;
        }

        const { data: productsData, error } = await supabase
          .from('btl_productos')
          .select(`
            id,
            nombre,
            marca,
            btl_cliente_productos!inner(visible_dashboard, orden)
          `)
          .eq('btl_cliente_productos.usuario_id', (btlUser as any).id)
          .eq('activo', true)
          .order('marca', { ascending: true });

        if (error) throw error;

        if (productsData && productsData.length > 0) {
          setProducts(productsData as any);
          setSelectedProductId((productsData[0] as any).id);
        } else {
          setProducts([]);
          setSelectedProductId(null);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <>
      {/* Floating Action Buttons - Hide in demo mode */}
      {!isDemo && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col gap-2 sm:gap-3">
          {/* Ticket Button */}
          <button
            onClick={() => setShowTicketModal(true)}
            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-theme-secondary to-theme-primary hover:brightness-110 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
            title="Crear Ticket o Solicitud"
          >
            <MessageSquarePlus className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        </div>
      )}

      {/* Loading state: prevent mounting dashboards with null productId */}
      {!isDemo && loadingProducts && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-12 flex flex-col items-center justify-center min-h-[350px]">
          <LoadingSpinner size="lg" text="Cargando métricas de producto..." />
        </div>
      )}

      {/* Empty products state */}
      {!isDemo && !loadingProducts && products.length === 0 && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-8">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-8 shadow-xl text-center">
            <Package className="w-16 h-16 text-content-muted mx-auto mb-4" />
            <h3 className="text-xl text-content-main font-semibold mb-2">No tienes productos asignados</h3>
            <p className="text-content-muted text-sm">Contacta al administrador para que asigne productos a tu cuenta.</p>
          </div>
        </div>
      )}

      {/* Main dashboard content: only mounted when product is resolved */}
      {(isDemo || (!loadingProducts && selectedProductId)) && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-6 space-y-6">
          {/* Product Metrics Section */}
          {!isDemo && showProductMetrics && (
            <ProductMetrics
              isAdmin={isAdmin}
              dateFilter={dateFilter}
              regionFilter={regionFilter}
              // Controlled props
              products={products}
              selectedProductId={selectedProductId}
              onProductSelect={setSelectedProductId}
            />
          )}

          {/* Training Analytics Section */}
          <VenueTrainingAnalytics
            session={session}
            selectedProductId={selectedProductId}
            isDemo={isDemo}
            isAdmin={isAdmin}
            regionFilter={regionFilter}
          />

          {/* Read-only Dashboard */}
          <ManagerDashboard
            session={session}
            readOnly={true}
            isDemo={isDemo}
            // Pass shared state
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            // New filtered product
            productId={selectedProductId}
          />
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <TicketModal
          session={session}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </>
  );
}
