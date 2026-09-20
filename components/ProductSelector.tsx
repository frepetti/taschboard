import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { X, Eye, EyeOff, Package, Check } from 'lucide-react';

interface Product {
  id: string;
  nombre: string;
  marca: string;
  categoria: string | null;
  subcategoria: string | null;
  presentacion: string | null;
  color_primario: string | null;
  color_secundario: string | null;
  objetivo_presencia: number | null;
  objetivo_stock: number | null;
  objetivo_pop: number | null;
  logo_url?: string | null;
  visible_dashboard?: boolean;
  orden?: number | null;
}

interface ProductSelectorProps {
  onClose: () => void;
  onProductsChange?: (selectedProductIds: string[]) => void;
}

export function ProductSelector({ onClose, onProductsChange }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'all' | 'selected'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener usuario de btl_usuarios
      const { data: btlUser } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!btlUser) return;

      // Obtener todos los productos
      const { data: allProducts, error: productsError } = await supabase
        .from('btl_productos')
        .select('*')
        .eq('activo', true)
        .order('orden_visualizacion');

      if (productsError) throw productsError;

      // Obtener preferencias del usuario
      const { data: userPrefs, error: prefsError } = await supabase
        .from('btl_cliente_productos')
        .select('producto_id, visible_dashboard, orden')
        .eq('usuario_id', btlUser.id);

      if (prefsError) throw prefsError;

      // Merge productos con preferencias
      const productsWithPrefs = allProducts?.map(product => {
        const pref = userPrefs?.find(p => p.producto_id === product.id);
        return {
          ...product,
          visible_dashboard: pref?.visible_dashboard ?? true, // Por defecto visible
          orden: pref?.orden ?? product.orden_visualizacion
        };
      }) || [];

      setProducts(productsWithPrefs);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductVisibility = async (productId: string) => {
    try {
      // Optimistic update
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, visible_dashboard: !p.visible_dashboard } : p
        )
      );

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: btlUser } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!btlUser) return;

      const product = products.find(p => p.id === productId);
      const newVisibility = !product?.visible_dashboard;

      // Upsert preferencia
      const { error } = await supabase
        .from('btl_cliente_productos')
        .upsert({
          usuario_id: btlUser.id,
          producto_id: productId,
          visible_dashboard: newVisibility,
          orden: product?.orden || 0
        }, {
          onConflict: 'usuario_id,producto_id'
        });

      if (error) throw error;

      // Notificar cambio
      if (onProductsChange) {
        const selectedIds = products
          .filter(p => p.id === productId ? newVisibility : p.visible_dashboard)
          .map(p => p.id);
        onProductsChange(selectedIds);
      }
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      // Revert optimistic update
      loadProducts();
    }
  };

  const saveAndClose = () => {
    if (onProductsChange) {
      const selectedIds = products.filter(p => p.visible_dashboard).map(p => p.id);
      onProductsChange(selectedIds);
    }
    onClose();
  };

  const filteredProducts = activeTab === 'selected'
    ? products.filter(p => p.visible_dashboard)
    : products;

  const selectedCount = products.filter(p => p.visible_dashboard).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface-card border border-border-subtle rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-content-main">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-theme-primary/10 border border-theme-primary/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-2xl text-content-main font-bold">Seleccionar Productos</h2>
                  <p className="text-content-muted text-sm">
                    Elige qué productos quieres visualizar en tu dashboard
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-content-muted hover:text-content-main transition-colors p-2 hover:bg-surface-card-subtle rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'all'
                ? 'bg-theme-primary text-white shadow-sm'
                : 'bg-surface-card-subtle text-content-muted hover:text-content-main hover:bg-surface-card border border-border-subtle'
                }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('selected')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'selected'
                ? 'bg-theme-primary text-white shadow-sm'
                : 'bg-surface-card-subtle text-content-muted hover:text-content-main hover:bg-surface-card border border-border-subtle'
                }`}
            >
              Seleccionados ({selectedCount})
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-content-muted">Cargando productos...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-content-muted mx-auto mb-4" />
              <h3 className="text-xl text-content-main font-semibold mb-2">
                {activeTab === 'selected' ? 'No hay productos seleccionados' : 'No hay productos disponibles'}
              </h3>
              <p className="text-content-muted">
                {activeTab === 'selected'
                  ? 'Selecciona productos de la pestaña "Todos" para verlos aquí'
                  : 'Contacta al administrador para agregar productos'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`bg-surface-card border rounded-xl p-4 transition-all ${product.visible_dashboard
                    ? 'border-theme-primary/50 shadow-md ring-1 ring-theme-primary/20'
                    : 'border-border-subtle hover:border-theme-primary/30'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Icon */}
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: product.color_primario + '20',
                        borderColor: product.color_primario + '50',
                        borderWidth: '1px'
                      }}
                    >
                      {product.logo_url ? (
                        <img src={product.logo_url} alt={product.nombre} className="w-12 h-12 object-contain" />
                      ) : (
                        <span
                          className="text-2xl font-bold"
                          style={{ color: product.color_primario || undefined }}
                        >
                          {product.marca.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-content-main font-semibold text-sm mb-1">
                            {product.marca}
                          </h3>
                          <p className="text-content-muted text-xs">
                            {product.nombre}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleProductVisibility(product.id)}
                          className={`p-2 rounded-lg transition-all flex-shrink-0 ${product.visible_dashboard
                            ? 'bg-theme-primary text-white hover:brightness-95 shadow-sm'
                            : 'bg-surface-card-subtle text-content-muted hover:bg-surface-card hover:text-content-main border border-border-subtle'
                            }`}
                          title={product.visible_dashboard ? 'Ocultar del dashboard' : 'Mostrar en dashboard'}
                        >
                          {product.visible_dashboard ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Category & Presentation */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-surface-card-subtle text-content-muted border border-border-subtle text-xs rounded">
                          {product.categoria}
                        </span>
                        <span className="px-2 py-0.5 bg-surface-card-subtle text-content-muted border border-border-subtle text-xs rounded">
                          {product.presentacion}
                        </span>
                      </div>

                      {/* Objectives */}
                      {product.visible_dashboard && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-surface-card-subtle border border-border-subtle rounded px-2 py-1">
                            <div className="text-content-muted text-xs mb-0.5">Presencia</div>
                            <div className="text-content-main font-semibold text-xs">
                              {product.objetivo_presencia}%
                            </div>
                          </div>
                          <div className="bg-surface-card-subtle border border-border-subtle rounded px-2 py-1">
                            <div className="text-content-muted text-xs mb-0.5">Stock</div>
                            <div className="text-content-main font-semibold text-xs">
                              {product.objetivo_stock}%
                            </div>
                          </div>
                          <div className="bg-surface-card-subtle border border-border-subtle rounded px-2 py-1">
                            <div className="text-content-muted text-xs mb-0.5">POP</div>
                            <div className="text-content-main font-semibold text-xs">
                              {product.objetivo_pop}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-subtle bg-surface-card-subtle/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-content-muted">
              <span className="text-content-main font-semibold">{selectedCount}</span> de{' '}
              <span className="text-content-main font-semibold">{products.length}</span> productos seleccionados
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-surface-card-subtle text-content-main border border-border-subtle rounded-lg hover:bg-surface-card transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveAndClose}
                disabled={false}
                className="px-6 py-2.5 bg-theme-primary text-white rounded-lg hover:brightness-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Aplicar Selección
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
