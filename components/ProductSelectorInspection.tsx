import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Package, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface ProductSelectorProps {
  venue: any;
  onBack: () => void;
  onProductSelect: (product: any) => void;
}

interface Product {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  presentacion: string;
  logo_url: string | null;
  color_primario: string | null;
}

export function ProductSelectorInspection({ venue, onBack, onProductSelect }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading products from btl_productos...');
      const { data, error: loadError } = await supabase
        .from('btl_productos')
        .select('*')
        .eq('activo', true)
        .order('orden_visualizacion', { ascending: true });

      if (loadError) {
        console.error('❌ Error loading products:', loadError);
        throw loadError;
      }
      
      console.log('✅ Loaded products:', data?.length || 0);
      setProducts(data || []);
      
      if (!data || data.length === 0) {
        setError('No hay productos disponibles en el sistema. Por favor contacta al administrador para que cargue productos.');
      }
    } catch (err: any) {
      console.error('❌ Error loading products:', err);
      setError(err.message || 'Error al cargar los productos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.categoria).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Cerveza': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Whisky': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Vodka': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Ron': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Tequila': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Cambiar Venue</span>
          </button>
          <h2 className="text-xl text-white font-semibold">{venue.name}</h2>
          <p className="text-sm text-slate-400">{venue.address}</p>
        </div>

        {/* Error State */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl text-white font-semibold mb-2">No hay productos disponibles</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadProducts}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Cambiar Venue</span>
        </button>
        <h2 className="text-xl text-white font-semibold">{venue.name}</h2>
        <p className="text-sm text-slate-400">{venue.address}</p>
      </div>

      {/* Product Selection */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg text-white font-semibold">Selecciona el Producto</h3>
            <p className="text-sm text-slate-400">Elige el producto que vas a inspeccionar</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => onProductSelect(product)}
                className="group relative bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Product Icon/Logo */}
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: product.color_primario 
                        ? `${product.color_primario}20` 
                        : 'rgba(100, 116, 139, 0.2)'
                    }}
                  >
                    {product.logo_url ? (
                      <img 
                        src={product.logo_url} 
                        alt={product.marca}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Package className="w-6 h-6" style={{ color: product.color_primario || '#94a3b8' }} />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-semibold text-sm leading-tight">
                        {product.marca}
                      </h4>
                      <CheckCircle className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-slate-400 text-xs mb-2 line-clamp-2">{product.nombre}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs border ${getCategoryColor(product.categoria)}`}>
                        {product.categoria}
                      </span>
                      {product.presentacion && (
                        <span className="text-xs text-slate-500">
                          {product.presentacion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}