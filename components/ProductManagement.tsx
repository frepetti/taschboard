import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface Product {
  id?: string;
  nombre: string;
  marca: string;
  categoria: string | null;
  subcategoria: string | null;
  sku: string | null;
  codigo_barras: string | null;
  presentacion: string | null;
  color_primario: string | null;
  color_secundario: string | null;
  objetivo_presencia: number | null;
  objetivo_stock: number | null;
  objetivo_pop: number | null;
  descripcion: string | null;
  activo: boolean | null;
  orden_visualizacion: number | null;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const emptyProduct: Product = {
    nombre: '',
    marca: '',
    categoria: 'Cerveza',
    subcategoria: 'Premium',
    sku: '',
    codigo_barras: '',
    presentacion: '',
    color_primario: '#FFD700',
    color_secundario: '#FFFFFF',
    objetivo_presencia: 80,
    objetivo_stock: 75,
    objetivo_pop: 60,
    descripcion: '',
    activo: true,
    orden_visualizacion: 0
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('btl_productos')
        .select('*')
        .order('orden_visualizacion');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      if (product.id) {
        // Update
        const { error } = await supabase
          .from('btl_productos')
          .update(product)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('btl_productos')
          .insert([product]);

        if (error) throw error;
      }

      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
      toast.success('Producto guardado correctamente');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const id = productToDelete;

    try {
      const { error } = await supabase
        .from('btl_productos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadProducts();
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white font-bold mb-1">Gestión de Productos</h2>
          <p className="text-slate-400">
            Administra el catálogo de productos disponibles para los clientes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(emptyProduct);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos por nombre, marca o SKU..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: product.color_primario + '20',
                    borderColor: product.color_primario + '50',
                    borderWidth: '1px'
                  }}
                >
                  <span
                    className="text-xl font-bold"
                    style={{ color: product.color_primario || undefined }}
                  >
                    {product.marca.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{product.marca}</h3>
                      <p className="text-slate-400 text-sm">{product.nombre}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => product.id && handleDeleteProduct(product.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
                        {product.categoria}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
                        {product.presentacion}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      SKU: {product.sku}
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-slate-400">Presencia</div>
                        <div className="text-white font-semibold">{product.objetivo_presencia}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">Stock</div>
                        <div className="text-white font-semibold">{product.objetivo_stock}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">POP</div>
                        <div className="text-white font-semibold">{product.objetivo_pop}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Product Form Modal */}
      {showForm && editingProduct && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

// Product Form Component
function ProductForm({
  product,
  onSave,
  onClose
}: {
  product: Product;
  onSave: (product: Product) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-white font-bold">
                {formData.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Marca *</label>
                <input
                  type="text"
                  required
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">SKU *</label>
                <input
                  type="text"
                  required
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Nombre del Producto *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Categoría</label>
                <select
                  value={formData.categoria || ''}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option>Cerveza</option>
                  <option>Whisky</option>
                  <option>Vodka</option>
                  <option>Ron</option>
                  <option>Tequila</option>
                  <option>Gin</option>
                  <option>Vino</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Subcategoría</label>
                <select
                  value={formData.subcategoria || ''}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option>Premium</option>
                  <option>Estándar</option>
                  <option>Popular</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Presentación</label>
                <input
                  type="text"
                  value={formData.presentacion || ''}
                  onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                  placeholder="355ml, 750ml..."
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Color Primario</label>
                <input
                  type="color"
                  value={formData.color_primario || '#000000'}
                  onChange={(e) => setFormData({ ...formData, color_primario: e.target.value })}
                  className="w-full h-10 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Color Secundario</label>
                <input
                  type="color"
                  value={formData.color_secundario || '#000000'}
                  onChange={(e) => setFormData({ ...formData, color_secundario: e.target.value })}
                  className="w-full h-10 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Objetivo Presencia (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.objetivo_presencia ?? 0}
                  onChange={(e) => setFormData({ ...formData, objetivo_presencia: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Objetivo Stock (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.objetivo_stock ?? 0}
                  onChange={(e) => setFormData({ ...formData, objetivo_stock: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Objetivo POP (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.objetivo_pop ?? 0}
                  onChange={(e) => setFormData({ ...formData, objetivo_pop: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
