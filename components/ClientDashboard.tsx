import { useState } from 'react';
import { ManagerDashboard } from './ManagerDashboard';
import { MessageSquarePlus } from 'lucide-react';
import { TicketModal } from './TicketModal';
import { ProductMetrics } from './ProductMetrics';
import { VenueTrainingAnalytics } from './VenueTrainingAnalytics';

interface ClientDashboardProps {
  session: any;
  isDemo?: boolean;
  isAdmin?: boolean;
}

export function ClientDashboard({ session, isDemo = false, isAdmin = false }: ClientDashboardProps) {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showProductMetrics, _setShowProductMetrics] = useState(true);

  // Shared State for Filters (Lifted from ManagerDashboard)
  const [dateFilter, setDateFilter] = useState('1M');
  const [regionFilter, setRegionFilter] = useState('all');

  return (
    <>
      {/* Floating Action Buttons - Hide in demo mode */}
      {!isDemo && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col gap-2 sm:gap-3">
          {/* Ticket Button */}
          <button
            onClick={() => setShowTicketModal(true)}
            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
            title="Crear Ticket o Solicitud"
          >
            <MessageSquarePlus className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 space-y-6">
        {/* Product Metrics Section */}
        {!isDemo && showProductMetrics && (
          <ProductMetrics
            isAdmin={isAdmin}
            dateFilter={dateFilter}
            regionFilter={regionFilter}
          />
        )}

        {/* Training Analytics Section */}
        {!isDemo && (
          <VenueTrainingAnalytics session={session} />
        )}

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
        />
      </div>

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
