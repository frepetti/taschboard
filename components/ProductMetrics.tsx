import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Package, TrendingUp, TrendingDown, AlertCircle, ChevronDown } from 'lucide-react';

interface ProductMetric {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  color_primario: string;
  presencia_actual: number;
  presencia_objetivo: number;
  stock_actual: number;
  stock_objetivo: number;
  pop_actual: number;
  pop_objetivo: number;
  puntos_venta_con_producto: number;
  total_puntos_venta: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface Product {
  id: string;
  nombre: string;
  marca: string;
}

interface ProductMetricsProps {
  isAdmin?: boolean;
}

export function ProductMetrics({ isAdmin = false }: ProductMetricsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [metric, setMetric] = useState<ProductMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      loadMetricsForProduct(selectedProductId);
    }
  }, [selectedProductId]);

  const loadProducts = async () => {
    try {
      setLoading(true);

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
        }
      } else {
        // Client: load only assigned products
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: btlUser } = await supabase
          .from('btl_usuarios')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!btlUser) return;

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
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetricsForProduct = async (productId: string) => {
    try {
      setLoadingMetrics(true);

      const { data: product, error: productError } = await supabase
        .from('btl_productos')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Obtener inspecciones con este producto (ahora directamente de btl_inspecciones)
      const { data: inspectionProducts, error: inspError } = await supabase
        .from('btl_inspecciones')
        .select('*')
        .eq('producto_id', productId);

      if (inspError) throw inspError;

      // Contar puntos de venta únicos con el producto
      const uniqueVenues = new Set(
        inspectionProducts?.map((ip: any) => ip.punto_venta_id) || []
      );

      // Calcular métricas
      const totalInspections = inspectionProducts?.length || 0;
      const withProduct = inspectionProducts?.filter((ip: any) => ip.tiene_producto).length || 0;
      const withStock = inspectionProducts?.filter((ip: any) =>
        ip.tiene_producto && ip.stock_nivel && ip.stock_nivel !== 'agotado'
      ).length || 0;
      const withPOP = inspectionProducts?.filter((ip: any) => ip.tiene_material_pop).length || 0;

      const presenciaActual = totalInspections > 0 ? (withProduct / totalInspections) * 100 : 0;
      const stockActual = totalInspections > 0 ? (withStock / totalInspections) * 100 : 0;
      const popActual = totalInspections > 0 ? (withPOP / totalInspections) * 100 : 0;

      const p = product as any;
      const calculatedMetric: ProductMetric = {
        id: p.id,
        nombre: p.nombre,
        marca: p.marca,
        categoria: p.categoria,
        color_primario: p.color_primario,
        presencia_actual: Math.round(presenciaActual * 10) / 10,
        presencia_objetivo: p.objetivo_presencia,
        stock_actual: Math.round(stockActual * 10) / 10,
        stock_objetivo: p.objetivo_stock,
        pop_actual: Math.round(popActual * 10) / 10,
        pop_objetivo: p.objetivo_pop,
        puntos_venta_con_producto: uniqueVenues.size,
        total_puntos_venta: totalInspections,
        tendencia: presenciaActual >= (p.objetivo_presencia || 0) ? 'up' : 'down'
      };

      setMetric(calculatedMetric);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const getStatusColor = (actual: number, objetivo: number) => {
    const percentage = (actual / objetivo) * 100;
    if (percentage >= 100) return 'text-green-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (actual: number, objetivo: number) => {
    const percentage = (actual / objetivo) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 shadow-xl">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 shadow-xl">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-semibold mb-2">
            No hay productos disponibles
          </h3>
          <p className="text-slate-400 mb-6">
            Contacta a tu administrador para asignar productos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl text-white font-semibold mb-1">Métricas por Producto</h2>
          <p className="text-slate-400 text-sm">
            Selecciona un producto para ver su desempeño detallado
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
          <select
            value={selectedProductId || ''}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-white pl-4 pr-10 py-2.5 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.marca} - {product.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Card */}
      {loadingMetrics || !metric ? (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 shadow-xl flex justify-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 sm:p-8 shadow-xl">
          {/* Product Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 border-b border-slate-700/50 pb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{
                backgroundColor: metric.color_primario + '20',
                borderColor: metric.color_primario + '50',
                borderWidth: '1px'
              }}
            >
              <span
                className="text-4xl font-bold"
                style={{ color: metric.color_primario }}
              >
                {metric.marca.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl text-white font-bold mb-1">{metric.marca}</h3>
                  <p className="text-slate-400 text-lg mb-2">{metric.nombre}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full border border-slate-600/30">
                      {metric.categoria}
                    </span>
                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full border border-slate-600/30 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      {metric.puntos_venta_con_producto} PDV Activos
                    </span>
                  </div>
                </div>
                {metric.tendencia === 'up' ? (
                  <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                ) : (
                  <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Presencia */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 font-medium">Presencia en PDV</span>
                <span className={`text-xl font-bold ${getStatusColor(metric.presencia_actual, metric.presencia_objetivo)}`}>
                  {metric.presencia_actual}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Actual</span>
                <span>Objetivo: {metric.presencia_objetivo}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(metric.presencia_actual, metric.presencia_objetivo)} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min((metric.presencia_actual / metric.presencia_objetivo) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Stock */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 font-medium">Disponibilidad Stock</span>
                <span className={`text-xl font-bold ${getStatusColor(metric.stock_actual, metric.stock_objetivo)}`}>
                  {metric.stock_actual}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Actual</span>
                <span>Objetivo: {metric.stock_objetivo}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(metric.stock_actual, metric.stock_objetivo)} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min((metric.stock_actual / metric.stock_objetivo) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Material POP */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 font-medium">Material POP</span>
                <span className={`text-xl font-bold ${getStatusColor(metric.pop_actual, metric.pop_objetivo)}`}>
                  {metric.pop_actual}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Actual</span>
                <span>Objetivo: {metric.pop_objetivo}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(metric.pop_actual, metric.pop_objetivo)} transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min((metric.pop_actual / metric.pop_objetivo) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {(metric.presencia_actual < metric.presencia_objetivo * 0.75 ||
            metric.stock_actual < metric.stock_objetivo * 0.75 ||
            metric.pop_actual < metric.pop_objetivo * 0.75) && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-medium text-sm mb-1">Atención Requerida</h4>
                  <p className="text-sm text-red-300/80">
                    Uno o más indicadores están significativamente por debajo del objetivo establecido (menos del 75%). Se recomienda revisar la ejecución en punto de venta.
                  </p>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}