import { useState, useEffect } from 'react';
import { Search, Package, Plus, X, Check, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ClientProductManagementProps {
  session: any;
}

interface Client {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
}

interface Product {
  id: string;
  nombre: string;
  marca: string;
  categoria: string | null;
  presentacion: string | null;
}

interface ClientProduct {
  id: string;
  producto_id: string;
  usuario_id: string;
  btl_productos: Product;
}

export function ClientProductManagement({ session: _session }: ClientProductManagementProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientProducts, setClientProducts] = useState<ClientProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [selectedProductsToAdd, setSelectedProductsToAdd] = useState<string[]>([]);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
    loadAvailableProducts();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientProducts();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('btl_usuarios')
        .select('id, nombre, email, empresa')
        .eq('rol', 'client')
        .order('nombre');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('btl_productos')
        .select('id, nombre, marca, categoria, presentacion')
        .order('marca, nombre');

      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadClientProducts = async () => {
    if (!selectedClient) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('btl_cliente_productos')
        .select(`
          id,
          producto_id,
          usuario_id,
          btl_productos!inner (
            id,
            nombre,
            marca,
            categoria,
            presentacion
          )
        `)
        .eq('usuario_id', selectedClient.id);

      if (error) throw error;
      setClientProducts((data as any) || []);
    } catch (error) {
      console.error('Error loading client products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducts = async () => {
    if (!selectedClient || selectedProductsToAdd.length === 0) return;

    setSaving(true);
    try {
      const insertData = selectedProductsToAdd.map((productId) => ({
        usuario_id: selectedClient.id,
        producto_id: productId
      }));

      const { error } = await supabase
        .from('btl_cliente_productos')
        .insert(insertData);

      if (error) throw error;

      await loadClientProducts();
      setShowAddProducts(false);
      setSelectedProductsToAdd([]);
      toast.success('Productos agregados exitosamente');
    } catch (error) {
      console.error('Error adding products:', error);
      toast.error('Error al agregar productos');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProduct = (clientProductId: string) => {
    setProductToDelete(clientProductId);
  };

  const confirmRemoveProduct = async () => {
    if (!productToDelete) return;
    const clientProductId = productToDelete;

    try {
      const { error } = await supabase
        .from('btl_cliente_productos')
        .delete()
        .eq('id', clientProductId);

      if (error) throw error;
      await loadClientProducts();
      toast.success('Producto eliminado del cliente');
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleUpdateProduct = async (clientProductId: string, updates: Partial<ClientProduct>) => {
    try {
      const { error } = await supabase
        .from('btl_cliente_productos')
        .update(updates)
        .eq('id', clientProductId);

      if (error) throw error;
      await loadClientProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
    }
  };



  const filteredClients = clients.filter(client =>
    client.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.empresa?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignedProductIds = clientProducts.map(cp => cp.producto_id);
  const unassignedProducts = availableProducts.filter(p => !assignedProductIds.includes(p.id));

  if (loading && !selectedClient) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white font-semibold mb-2">Gestión de Productos por Cliente</h2>
        <p className="text-slate-400 text-sm">
          Asigna productos a cada cliente para que aparezcan en sus solicitudes de tickets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Client List */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>Clientes</span>
              <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">{clients.length}</span>
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Client List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedClient?.id === client.id
                    ? 'bg-amber-600/20 border-amber-600 text-white'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                >
                  <div className="font-medium text-sm">{client.nombre}</div>
                  <div className="text-xs text-slate-400 truncate">{client.email}</div>
                  {client.empresa && (
                    <div className="text-xs text-slate-500 mt-1">{client.empresa}</div>
                  )}
                </button>
              ))}

              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No se encontraron clientes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Products */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    Productos de {selectedClient.nombre}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {clientProducts.length} productos asignados
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProducts(true)}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Productos</span>
                </button>
              </div>

              {/* Products List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : clientProducts.length > 0 ? (
                <div className="space-y-3">
                  {clientProducts.map((cp) => (
                    <div
                      key={cp.id}
                      className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-white font-medium">{cp.btl_productos.nombre}</h4>
                              <p className="text-slate-400 text-sm">{cp.btl_productos.marca}</p>
                              {cp.btl_productos.categoria && (
                                <p className="text-slate-500 text-xs mt-1">{cp.btl_productos.categoria}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveProduct(cp.id)}
                              className="p-2 hover:bg-red-600/20 rounded-lg text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">
                    Este cliente no tiene productos asignados
                  </p>
                  <button
                    onClick={() => setShowAddProducts(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Agregar Productos
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl p-12 text-center">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Selecciona un Cliente
              </h3>
              <p className="text-slate-400">
                Elige un cliente de la lista para gestionar sus productos
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmRemoveProduct}
        title="Eliminar Producto del Cliente"
        message="¿Estás seguro de que deseas eliminar este producto del cliente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Add Products Modal */}
      {showAddProducts && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-xl text-white font-semibold">
                Agregar Productos a {selectedClient.nombre}
              </h3>
              <button
                onClick={() => {
                  setShowAddProducts(false);
                  setSelectedProductsToAdd([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {unassignedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unassignedProducts.map((product) => (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedProductsToAdd.includes(product.id)
                        ? 'bg-amber-600/10 border-amber-600 shadow-sm shadow-amber-500/20'
                        : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductsToAdd.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductsToAdd([...selectedProductsToAdd, product.id]);
                          } else {
                            setSelectedProductsToAdd(selectedProductsToAdd.filter(id => id !== product.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-slate-600 text-amber-600 focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-0 bg-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{product.nombre}</div>
                        <div className="text-slate-400 text-xs truncate">{product.marca}</div>
                        {product.categoria && (
                          <div className="text-slate-500 text-xs mt-0.5">{product.categoria}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Todos los productos ya están asignados a este cliente
                </div>
              )}

              {selectedProductsToAdd.length > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-400">
                    ✓ {selectedProductsToAdd.length} producto{selectedProductsToAdd.length !== 1 ? 's' : ''} seleccionado{selectedProductsToAdd.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700/50 flex gap-3">
              <button
                onClick={() => {
                  setShowAddProducts(false);
                  setSelectedProductsToAdd([]);
                }}
                disabled={saving}
                className="flex-1 bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProducts}
                disabled={saving || selectedProductsToAdd.length === 0}
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Agregando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Agregar Productos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
