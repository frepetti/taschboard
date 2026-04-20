import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Check, X, Plus, Minus, Package, Loader2, AlertTriangle, Users } from 'lucide-react';
import { uploadInspectionPhoto } from '../utils/api-direct';
import { toast } from 'sonner';
import { calculatePerfectServeScore, PerfectServeAnswer } from '../utils/scoreCalculations';
import { findSimilarCompetitor } from '../utils/stringUtils';

interface Competitor {
  name: string;
  visibility: string;
  priceComparison: string;
}

interface InspectionFormProps {
  venue: any;
  product: any;
  initialData?: any; // New prop for editing
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export function InspectionForm({ venue, product, initialData, onBack, onSubmit }: InspectionFormProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Competitor input state
  const [competitorInput, setCompetitorInput] = useState('');
  const [competitorVisibility, setCompetitorVisibility] = useState('medium');
  const [competitorPrice, setCompetitorPrice] = useState('premium');
  const [similarWarning, setSimilarWarning] = useState<string | null>(null);
  const [pendingCompetitor, setPendingCompetitor] = useState<Competitor | null>(null);

  const [formData, setFormData] = useState({
    // Brand Presence
    brandOnMenu: true,
    numberOfCocktails: 3,
    backBarVisibility: 'prominent',
    shelfPosition: 'top',

    // Perfect Serve
    properGlassware: true,
    iceQuality: true,
    correctGarnish: true,
    premiumTonic: true,
    serveRitual: true,

    // Materials & Signage
    backBarSignage: 'good',
    menuInserts: 'present',
    coasters: 'present',
    tableCards: 'missing',
    outdoorSignage: 'not-applicable',

    // Staff & Training
    staffKnowledge: 8,
    certifiedBartenders: 2,
    totalBartenders: 4,
    brandAdvocacy: 'high',

    // Competition — nuevo: array de competidores
    competitors: [] as Competitor[],
    // Legacy alias (primer elemento) para backward compat con historial
    mainCompetitor: '',
    competitorVisibility: 'medium',
    priceComparison: 'premium',

    // Sales & Rotation
    estimatedMonthlyRotation: 120,
    stockLevel: 'adequate',
    outOfStock: false,

    // Opportunities
    trainingNeeded: true,
    materialRefresh: true,
    activationPotential: 'high',

    // Photos
    photos: [] as string[],

    // Notes
    notes: '',
    recommendedActions: '',

    // Dynamic Perfect Serve — ahora soporta 'na' además de boolean
    perfectServeAnswers: {} as Record<string, PerfectServeAnswer>,
    perfectServeConfig: product?.configuracion?.perfect_serve || null
  });

  // Load initial data if provided (Edit Mode)
  useEffect(() => {
    if (initialData && initialData.detalles) {
      console.log('📝 Loading initial data into form:', initialData);
      setFormData(prev => ({
        ...prev,
        ...initialData.detalles,
        // Cargar array de competidores (nuevo formato) o migrar del campo legacy
        competitors: initialData.detalles.competitors ||
          (initialData.detalles.mainCompetitor
            ? [{ name: initialData.detalles.mainCompetitor, visibility: initialData.detalles.competitorVisibility || 'medium', priceComparison: initialData.detalles.priceComparison || 'premium' }]
            : []),
        photos: initialData.fotos_urls || [],
        notes: initialData.observaciones?.split('[RECOMENDACIONES]')[0]?.trim() || '',
        recommendedActions: initialData.observaciones?.split('[RECOMENDACIONES]')[1]?.trim() || '',
      }));
    }
  }, [initialData]);

  const sections = [
    { id: 0, title: 'Presencia de Marca', icon: '🏷️' },
    { id: 1, title: 'Perfect Serve', icon: '🍸' },
    { id: 2, title: 'Materiales y Señalización', icon: '📋' },
    { id: 3, title: 'Personal y Capacitación', icon: '👥' },
    { id: 4, title: 'Competencia', icon: '⚔️' },
    { id: 5, title: 'Datos de Venta', icon: '📊' },
    { id: 6, title: 'Fotos y Notas', icon: '📸' },
  ];

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // ─── Perfect Serve: triple state cycle ─────────────────────────────────────
  const cyclePerfectServeAnswer = (id: string) => {
    const current = formData.perfectServeAnswers[id];
    let next: PerfectServeAnswer;
    if (current === undefined || current === false) next = true;
    else if (current === true) next = 'na';
    else next = false; // 'na' → false
    updateField('perfectServeAnswers', { ...formData.perfectServeAnswers, [id]: next });
  };

  const getPerfectServeButtonStyle = (answer: PerfectServeAnswer | undefined) => {
    if (answer === true) return 'bg-green-600 text-white ring-2 ring-green-500/50';
    if (answer === 'na') return 'bg-slate-600 text-slate-300 ring-2 ring-slate-500/50';
    return 'bg-red-700/60 text-red-300';
  };

  const getPerfectServeIcon = (answer: PerfectServeAnswer | undefined) => {
    if (answer === true) return <Check className="w-4 h-4" />;
    if (answer === 'na') return <span className="text-xs font-bold">N/A</span>;
    return <X className="w-4 h-4" />;
  };

  // Calcular score temps de Perfect Serve para mostrar en tiempo real
  const getPerfectServeQuestions = () => {
    if (product?.configuracion?.perfect_serve && product.configuracion.perfect_serve.length > 0) {
      return product.configuracion.perfect_serve;
    }
    return [
      { id: 'properGlassware', question: 'Cristalería Correcta (Copa/Balón)' },
      { id: 'iceQuality', question: 'Calidad y Tamaño del Hielo' },
      { id: 'correctGarnish', question: 'Garnish Correcto (Pepino)' },
      { id: 'premiumTonic', question: 'Tónica Premium' },
      { id: 'serveRitual', question: 'Ejecución del Ritual de Servicio' },
    ];
  };

  const perfectServeEnabled = product?.configuracion?.perfect_serve_enabled !== false;

  const getPerfectServeScore = () => {
    if (!perfectServeEnabled) return null;
    const questions = getPerfectServeQuestions();
    // Para el checklist legacy, mapear los booleanos directos al formato de answers
    let answers = { ...formData.perfectServeAnswers };
    if (!(product?.configuracion?.perfect_serve?.length > 0)) {
      const legacyKeys = ['properGlassware', 'iceQuality', 'correctGarnish', 'premiumTonic', 'serveRitual'];
      legacyKeys.forEach(k => {
        if (!(k in answers)) {
          answers[k] = (formData as any)[k] ?? false;
        }
      });
    }
    return calculatePerfectServeScore(answers, questions);
  };

  // ─── Competitors ────────────────────────────────────────────────────────────
  const tryAddCompetitor = () => {
    const name = competitorInput.trim();
    if (!name) return;

    // Check exact duplicate already in the list
    if (formData.competitors.some((c: Competitor) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Este competidor ya fue agregado a la lista');
      return;
    }

    // Fuzzy matching against product's known competitors
    const existingNames = product?.competidores || [];
    const similar = findSimilarCompetitor(name, existingNames);

    if (similar) {
      setSimilarWarning(similar);
      setPendingCompetitor({ name, visibility: competitorVisibility, priceComparison: competitorPrice });
      return;
    }

    confirmAddCompetitor({ name, visibility: competitorVisibility, priceComparison: competitorPrice });
  };

  const confirmAddCompetitor = (comp: Competitor) => {
    const updated = [...formData.competitors, comp];
    setFormData({
      ...formData,
      competitors: updated,
      mainCompetitor: updated[0]?.name || '',
    });
    setCompetitorInput('');
    setSimilarWarning(null);
    setPendingCompetitor(null);
  };

  const removeCompetitor = (index: number) => {
    const updated = formData.competitors.filter((_: Competitor, i: number) => i !== index);
    setFormData({ ...formData, competitors: updated, mainCompetitor: updated[0]?.name || '' });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const newUrls: string[] = [];

      try {
        for (const file of files) {
          const url = await uploadInspectionPhoto(file);
          newUrls.push(url);
        }
        updateField('photos', [...formData.photos, ...newUrls]);
        toast.success(`${newUrls.length} foto(s) subida(s) correctamente`);
      } catch (error) {
        console.error('Error uploading photos:', error);
        toast.error('Error al subir las fotos');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  // Validación de seguridad - si no hay producto, mostrar mensaje
  if (!product) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl text-white font-semibold mb-2">Error: Producto no seleccionado</h3>
          <p className="text-slate-400 mb-6">No se pudo cargar la información del producto.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver a seleccionar producto
          </button>
        </div>
      </div>
    );
  }

  const psScore = getPerfectServeScore();

  return (
    <div className="space-y-4">
      {/* Venue Header */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Cambiar Producto</span>
        </button>

        {/* Venue Info */}
        <h2 className="text-xl text-white font-semibold mb-1">{venue.name}</h2>
        <p className="text-sm text-slate-400 mb-3">{venue.address}</p>

        {/* Product Badge */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
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
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Package className="w-5 h-5" style={{ color: product.color_primario || '#94a3b8' }} />
            )}
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">{product.marca}</div>
            <div className="text-slate-400 text-xs">{product.nombre}</div>
          </div>
          <div className="text-xs text-slate-500 px-2 py-1 bg-slate-800/50 rounded">
            {product.categoria}
          </div>
          {/* Perfect Serve score en tiempo real */}
          {psScore !== null && activeSection === 1 && (
            <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${psScore >= 80 ? 'bg-green-600/20 text-green-400' : psScore >= 50 ? 'bg-amber-600/20 text-amber-400' : 'bg-red-600/20 text-red-400'}`}>
              PS: {psScore}%
            </div>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all ${activeSection === section.id
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
            >
              <span className="text-lg sm:text-base">{section.icon}</span>
              <span className="text-xs sm:text-sm text-center sm:text-left leading-tight">{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">

        {/* Section 0: Brand Presence */}
        {activeSection === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Presencia de Marca</h3>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Marca en Menú</label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateField('brandOnMenu', true)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${formData.brandOnMenu
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800/50 text-slate-400'
                    }`}
                >
                  Sí
                </button>
                <button
                  onClick={() => updateField('brandOnMenu', false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${!formData.brandOnMenu
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800/50 text-slate-400'
                    }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Cantidad de Cocteles con la Marca</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateField('numberOfCocktails', Math.max(0, formData.numberOfCocktails - 1))}
                  className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-white flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <div className="text-3xl text-white font-bold">{formData.numberOfCocktails}</div>
                </div>
                <button
                  onClick={() => updateField('numberOfCocktails', formData.numberOfCocktails + 1)}
                  className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Visibilidad en Barra</label>
              <select
                value={formData.backBarVisibility}
                onChange={(e) => updateField('backBarVisibility', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="prominent">Destacado</option>
                <option value="visible">Visible</option>
                <option value="hidden">Oculto</option>
                <option value="not-present">No Presente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Posición en Estante</label>
              <select
                value={formData.shelfPosition}
                onChange={(e) => updateField('shelfPosition', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="top">Superior</option>
                <option value="middle">Medio</option>
                <option value="bottom">Inferior</option>
                <option value="not-present">No Presente</option>
              </select>
            </div>
          </div>
        )}

        {/* Section 1: Perfect Serve */}
        {activeSection === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg text-white font-semibold">Checklist Perfect Serve</h3>
              {psScore !== null && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${psScore >= 80 ? 'bg-green-600/20 text-green-400' : psScore >= 50 ? 'bg-amber-600/20 text-amber-400' : 'bg-red-600/20 text-red-400'}`}>
                  Score PS: {psScore}%
                </div>
              )}
            </div>

            {/* Leyenda de estados */}
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1"><span className="w-5 h-5 rounded bg-green-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></span> Cumple</span>
              <span className="flex items-center gap-1"><span className="w-5 h-5 rounded bg-red-700/60 flex items-center justify-center"><X className="w-3 h-3 text-red-300" /></span> No Cumple</span>
              <span className="flex items-center gap-1"><span className="w-5 h-5 rounded bg-slate-600 flex items-center justify-center text-slate-300 font-bold" style={{ fontSize: 9 }}>N/A</span> No Aplica (excluye del score)</span>
            </div>

            {/* Perfect Serve deshabilitado para este producto */}
            {!perfectServeEnabled ? (
              <div className="flex items-center gap-3 p-4 bg-slate-700/30 border border-slate-600/40 rounded-lg">
                <Package className="w-6 h-6 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-300 font-medium text-sm">Perfect Serve no configurado</p>
                  <p className="text-slate-500 text-xs mt-0.5">Este producto no tiene un checklist de Perfect Serve habilitado. Podés configurarlo en el panel de administración.</p>
                </div>
              </div>
            ) : (product.configuracion?.perfect_serve && product.configuracion.perfect_serve.length > 0) ? (
              // Dynamic Questions from Configuration
              <div className="space-y-3">
                {product.configuracion.perfect_serve.map((q: any) => {
                  const answer = formData.perfectServeAnswers?.[q.id];
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
                    >
                      <div className="flex flex-col flex-1 pr-3">
                        <span className="text-slate-300 text-sm">{q.question}</span>
                        {q.required && <span className="text-xs text-amber-500/70 mt-0.5">Requerido</span>}
                        {answer === 'na' && (
                          <span className="text-xs text-slate-500 mt-0.5 italic">Excluido del cálculo de score</span>
                        )}
                      </div>
                      <button
                        onClick={() => cyclePerfectServeAnswer(q.id)}
                        className={`w-14 h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${getPerfectServeButtonStyle(answer)}`}
                        title="Clic para cambiar: Cumple → N/A → No Cumple"
                      >
                        {getPerfectServeIcon(answer)}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Legacy / Default Questions — también con triple estado
              [
                { key: 'properGlassware', label: 'Cristalería Correcta (Copa/Balón)' },
                { key: 'iceQuality', label: 'Calidad y Tamaño del Hielo' },
                { key: 'correctGarnish', label: 'Garnish Correcto (Pepino)' },
                { key: 'premiumTonic', label: 'Tónica Premium' },
                { key: 'serveRitual', label: 'Ejecución del Ritual de Servicio' },
              ].map((item) => {
                const answer = formData.perfectServeAnswers?.[item.key] ??
                  ((formData as any)[item.key] === true ? true : false);
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
                  >
                    <div className="flex flex-col flex-1 pr-3">
                      <span className="text-slate-300 text-sm">{item.label}</span>
                      {answer === 'na' && (
                        <span className="text-xs text-slate-500 mt-0.5 italic">Excluido del cálculo de score</span>
                      )}
                    </div>
                    <button
                      onClick={() => cyclePerfectServeAnswer(item.key)}
                      className={`w-14 h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${getPerfectServeButtonStyle(answer)}`}
                      title="Clic para cambiar: Cumple → N/A → No Cumple"
                    >
                      {getPerfectServeIcon(answer)}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Section 2: Materials & Signage */}
        {activeSection === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Materiales y Señalización</h3>

            <div className="space-y-6">
              <h3 className="text-lg text-white font-semibold">Materiales y Señalización</h3>

              {/* Quality Scale Items */}
              {[
                { key: 'backBarSignage', label: 'Señalización en Barra' },
                { key: 'outdoorSignage', label: 'Señalización Exterior' }
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm text-slate-300 mb-2">{item.label}</label>
                  <select
                    value={formData[item.key as keyof typeof formData] as string}
                    onChange={(e) => updateField(item.key, e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  >
                    <option value="good">Buena</option>
                    <option value="average">Promedio</option>
                    <option value="poor">Mala</option>
                    <option value="missing">Faltante</option>
                    <option value="not-applicable">No Aplica</option>
                  </select>
                </div>
              ))}

              {/* Binary Scale Items */}
              {[
                { key: 'menuInserts', label: 'Insertos en Menú' },
                { key: 'coasters', label: 'Posavasos' },
                { key: 'tableCards', label: 'Table Cards' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm text-slate-300 mb-2">{item.label}</label>
                  <select
                    value={formData[item.key as keyof typeof formData] as string}
                    onChange={(e) => updateField(item.key, e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  >
                    <option value="present">Presente</option>
                    <option value="missing">Faltante</option>
                    <option value="not-applicable">No Aplica</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Staff & Training */}
        {activeSection === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Personal y Capacitación</h3>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Nivel de Conocimiento (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.staffKnowledge}
                onChange={(e) => updateField('staffKnowledge', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Bajo</span>
                <span>{formData.staffKnowledge}</span>
                <span>Alto</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Bartenders Capacitados</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateField('certifiedBartenders', Math.max(0, formData.certifiedBartenders - 1))}
                    className="w-8 h-8 rounded bg-slate-800/50 hover:bg-slate-800 text-white flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="flex-1 text-center font-bold text-white">{formData.certifiedBartenders}</span>
                  <button
                    onClick={() => updateField('certifiedBartenders', formData.certifiedBartenders + 1)}
                    className="w-8 h-8 rounded bg-slate-800/50 hover:bg-slate-800 text-white flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Total de Bartenders</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateField('totalBartenders', Math.max(0, formData.totalBartenders - 1))}
                    className="w-8 h-8 rounded bg-slate-800/50 hover:bg-slate-800 text-white flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="flex-1 text-center font-bold text-white">{formData.totalBartenders}</span>
                  <button
                    onClick={() => updateField('totalBartenders', formData.totalBartenders + 1)}
                    className="w-8 h-8 rounded bg-slate-800/50 hover:bg-slate-800 text-white flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Recomendación de Marca</label>
              <select
                value={formData.brandAdvocacy}
                onChange={(e) => updateField('brandAdvocacy', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
                <option value="none">Ninguna</option>
              </select>
            </div>
          </div>
        )}

        {/* Section 4: Competition — MULTI-REGISTRO */}
        {activeSection === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-white font-semibold">Competencia</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Users className="w-4 h-4" />
                <span>{formData.competitors.length} competidor{formData.competitors.length !== 1 ? 'es' : ''}</span>
              </div>
            </div>

            {/* Lista de competidores agregados */}
            {formData.competitors.length > 0 && (
              <div className="space-y-2">
                {formData.competitors.map((comp: Competitor, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg group">
                    <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Competidor</div>
                        <div className="text-white font-medium truncate">{comp.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Visibilidad</div>
                        <div className={`text-xs font-medium ${comp.visibility === 'high' ? 'text-red-400' : comp.visibility === 'medium' ? 'text-amber-400' : 'text-green-400'}`}>
                          {comp.visibility === 'high' ? 'Alta' : comp.visibility === 'medium' ? 'Media' : 'Baja'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Precio</div>
                        <div className="text-slate-300 text-xs">
                          {comp.priceComparison === 'premium' ? 'Premium' : comp.priceComparison === 'equal' ? 'Par' : 'Menor'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCompetitor(idx)}
                      className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar competidor */}
            <div className="border border-slate-700/50 rounded-xl p-4 space-y-4 bg-slate-900/30">
              <p className="text-sm text-slate-400 font-medium">Agregar Competidor</p>

              {/* Selector de nombre */}
              {product?.competidores && product.competidores.length > 0 ? (
                <div className="space-y-2">
                  <label className="block text-xs text-slate-500">Nombre del competidor</label>
                  <select
                    value={product.competidores.includes(competitorInput) ? competitorInput : (competitorInput ? '__other__' : '')}
                    onChange={(e) => {
                      if (e.target.value === '__other__') {
                        setCompetitorInput('');
                      } else {
                        setCompetitorInput(e.target.value);
                        setSimilarWarning(null);
                      }
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  >
                    <option value="">Seleccionar competidor...</option>
                    {product.competidores
                      .filter((c: string) => !formData.competitors.some((fc: Competitor) => fc.name === c))
                      .map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    <option value="__other__">✏️ Otro (escribir manualmente)</option>
                  </select>

                  {(!product.competidores.includes(competitorInput) || competitorInput === '') && (
                    <input
                      type="text"
                      placeholder="Nombre del competidor..."
                      value={!product.competidores.includes(competitorInput) ? competitorInput : ''}
                      onChange={(e) => {
                        setCompetitorInput(e.target.value);
                        setSimilarWarning(null);
                      }}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                    />
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nombre del competidor</label>
                  <input
                    type="text"
                    placeholder="Nombre del competidor..."
                    value={competitorInput}
                    onChange={(e) => {
                      setCompetitorInput(e.target.value);
                      setSimilarWarning(null);
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
              )}

              {/* Alerta de similitud */}
              {similarWarning && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-amber-300 text-sm font-medium">¿Quisiste decir <span className="font-bold">"{similarWarning}"</span>?</p>
                    <p className="text-amber-400/70 text-xs mt-0.5">Parece que este competidor ya existe con un nombre muy similar. Verificá la ortografía o confirmá que es diferente.</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          setCompetitorInput(similarWarning);
                          setSimilarWarning(null);
                          setPendingCompetitor(null);
                        }}
                        className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-500 transition-colors"
                      >
                        Usar "{similarWarning}"
                      </button>
                      <button
                        onClick={() => {
                          if (pendingCompetitor) confirmAddCompetitor(pendingCompetitor);
                        }}
                        className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
                      >
                        Confirmar igual
                      </button>
                      <button
                        onClick={() => { setSimilarWarning(null); setPendingCompetitor(null); }}
                        className="text-xs px-2 py-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Visibilidad</label>
                  <select
                    value={competitorVisibility}
                    onChange={(e) => setCompetitorVisibility(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Comparación de precio</label>
                  <select
                    value={competitorPrice}
                    onChange={(e) => setCompetitorPrice(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  >
                    <option value="premium">Premium (+Alto)</option>
                    <option value="equal">Par (=)</option>
                    <option value="lower">Menor (-Bajo)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={tryAddCompetitor}
                disabled={!competitorInput.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Agregar Competidor
              </button>
            </div>

            {formData.competitors.length === 0 && (
              <p className="text-center text-slate-500 text-sm italic py-2">No se registraron competidores para esta inspección.</p>
            )}
          </div>
        )}

        {/* Section 5: Sales Data */}
        {activeSection === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Ventas y Rotación</h3>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Rotación Mensual Est. (Botellas)</label>
              <input
                type="number"
                value={formData.estimatedMonthlyRotation}
                onChange={(e) => updateField('estimatedMonthlyRotation', parseInt(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Nivel de Stock</label>
              <select
                value={formData.stockLevel}
                onChange={(e) => updateField('stockLevel', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="adequate">Adecuado</option>
                <option value="low">Bajo</option>
                <option value="critical">Crítico</option>
                <option value="out-of-stock">Sin Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">¿Sin Stock en los últimos 30 días?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateField('outOfStock', true)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${formData.outOfStock
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800/50 text-slate-400'
                    }`}
                >
                  Sí
                </button>
                <button
                  onClick={() => updateField('outOfStock', false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${!formData.outOfStock
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800/50 text-slate-400'
                    }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <h4 className="text-md text-white font-medium mb-3">Oportunidades</h4>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trainingNeeded}
                    onChange={(e) => updateField('trainingNeeded', e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-300">Necesita Capacitación</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.materialRefresh}
                    onChange={(e) => updateField('materialRefresh', e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-300">Necesita Renovar Materiales</span>
                </label>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-300 mb-2">Potencial de Activación</label>
                <select
                  value={formData.activationPotential}
                  onChange={(e) => updateField('activationPotential', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="high">Alto - Objetivo Principal</option>
                  <option value="medium">Medio - Buena Oportunidad</option>
                  <option value="low">Bajo - Potencial Limitado</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Photos & Notes */}
        {activeSection === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Fotos y Notas</h3>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Subir Fotos</label>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition-colors relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                      <span className="text-sm text-slate-300">Subiendo...</span>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                  disabled={isUploading}
                />
                <label htmlFor="photo-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                  <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 mb-1">Clic para subir fotos</p>
                  <p className="text-xs text-slate-500">Barra, señalización, materiales, perfect serve</p>
                </label>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {formData.photos.map((photo, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={photo}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        onClick={() => updateField('photos', formData.photos.filter((_: string, idx: number) => idx !== i))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Notas Generales</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                placeholder="Observaciones generales, interacción con personal, atmósfera..."
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Recomendaciones</label>
              <textarea
                value={formData.recommendedActions}
                onChange={(e) => updateField('recommendedActions', e.target.value)}
                rows={4}
                placeholder="Acciones específicas para mejorar presencia, capacitación, activaciones..."
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 sticky bottom-4">
        {activeSection > 0 && (
          <button
            onClick={() => setActiveSection(prev => prev - 1)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            Anterior
          </button>
        )}

        {activeSection < sections.length - 1 ? (
          <button
            onClick={() => setActiveSection(prev => prev + 1)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-medium ml-auto"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className={`px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-bold shadow-lg shadow-green-600/20 ml-auto flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subiendo fotos...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Enviar Inspección
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}