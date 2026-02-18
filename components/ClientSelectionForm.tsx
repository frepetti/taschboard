import { useState, useEffect } from 'react';
import { Search, User, ArrowLeft } from 'lucide-react';
import { getClients } from '../utils/api-direct';

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
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl text-white font-semibold">Seleccionar Cliente</h2>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400">Cargando clientes...</p>
                    </div>
                )}

                {/* Content when not loading */}
                {!loading && (
                    <>
                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>

                        {/* Empty State */}
                        {clients.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg text-white font-semibold mb-2">No hay clientes disponibles</h3>
                                <p className="text-slate-400">Contacta al administrador.</p>
                            </div>
                        )}

                        {/* Client List */}
                        {clients.length > 0 && (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {filteredClients.map((client) => (
                                    <button
                                        key={client.id}
                                        onClick={() => onClientSelect(client)}
                                        className="w-full text-left p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 rounded-lg transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold mb-1 group-hover:text-amber-400 transition-colors">
                                                    {client.nombre}
                                                </h3>
                                                {client.empresa && (
                                                    <div className="text-sm text-slate-400">
                                                        {client.empresa}
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {client.email}
                                                </div>
                                            </div>
                                            <User className="w-5 h-5 text-slate-600 group-hover:text-amber-500 transition-colors" />
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
