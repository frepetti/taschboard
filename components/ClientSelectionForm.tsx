import { useState, useEffect } from 'react';
import { Search, User, ArrowLeft } from 'lucide-react';
import { getClients } from '../utils/api-direct';
import { LoadingSpinner } from './LoadingSpinner';

interface ClientSelectionFormProps {
    onClientSelect: (client: any) => void;
    onBack: () => void;
}

export function ClientSelectionForm({ onClientSelect, onBack }: ClientSelectionFormProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await getClients();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
            // Fallback or empty
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.empresa && client.empresa.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-4">
            <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-surface-card-subtle rounded-full transition-colors text-content-muted hover:text-content-main"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl text-content-main font-semibold">Seleccionar Cliente</h2>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <LoadingSpinner size="lg" text="Cargando clientes..." />
                    </div>
                )}

                {/* Content when not loading */}
                {!loading && (
                    <>
                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
                            />
                        </div>

                        {/* Empty State */}
                        {clients.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-lg">
                                <User className="w-16 h-16 text-content-muted mx-auto mb-4" />
                                <h3 className="text-lg text-content-main font-semibold mb-2">No hay clientes disponibles</h3>
                                <p className="text-content-muted">Contacta al administrador.</p>
                            </div>
                        )}

                        {/* Client List */}
                        {clients.length > 0 && (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {filteredClients.map((client) => (
                                    <button
                                        key={client.id}
                                        onClick={() => onClientSelect(client)}
                                        className="w-full text-left p-4 bg-surface-card-subtle hover:bg-surface-card border border-border-subtle hover:border-theme-primary/50 rounded-lg transition-all group shadow-sm"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-content-main font-semibold mb-1 group-hover:text-theme-primary transition-colors">
                                                    {client.nombre}
                                                </h3>
                                                {client.empresa && (
                                                    <div className="text-sm text-content-muted">
                                                        {client.empresa}
                                                    </div>
                                                )}
                                                <div className="text-xs text-content-muted mt-1">
                                                    {client.email}
                                                </div>
                                            </div>
                                            <User className="w-5 h-5 text-content-muted group-hover:text-theme-primary transition-colors" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

