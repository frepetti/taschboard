import { useState } from 'react';
import { ArrowLeft, Camera, Check, X, Plus, Minus, Package } from 'lucide-react';

interface InspectionFormProps {
  venue: any;
  product: any;
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export function InspectionForm({ venue, product, onBack, onSubmit }: InspectionFormProps) {
  const [activeSection, setActiveSection] = useState(0);
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
    
    // Competition
    mainCompetitor: 'Tanqueray',
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
    recommendedActions: ''
  });

  const sections = [
    { id: 0, title: 'Brand Presence', icon: '🏷️' },
    { id: 1, title: 'Perfect Serve', icon: '🍸' },
    { id: 2, title: 'Materials & Signage', icon: '📋' },
    { id: 3, title: 'Staff & Training', icon: '👥' },
    { id: 4, title: 'Competition', icon: '⚔️' },
    { id: 5, title: 'Sales Data', icon: '📊' },
    { id: 6, title: 'Photos & Notes', icon: '📸' },
  ];

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const photoUrls = files.map(file => URL.createObjectURL(file));
      updateField('photos', [...formData.photos, ...photoUrls]);
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
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id
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
            <h3 className="text-lg text-white font-semibold">Brand Presence</h3>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Brand on Menu</label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateField('brandOnMenu', true)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.brandOnMenu
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => updateField('brandOnMenu', false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    !formData.brandOnMenu
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Number of Cocktails Featuring Brand</label>
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
              <label className="block text-sm text-slate-300 mb-2">Back Bar Visibility</label>
              <select
                value={formData.backBarVisibility}
                onChange={(e) => updateField('backBarVisibility', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="prominent">Prominent</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="not-present">Not Present</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Shelf Position</label>
              <select
                value={formData.shelfPosition}
                onChange={(e) => updateField('shelfPosition', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="top">Top Shelf</option>
                <option value="middle">Middle Shelf</option>
                <option value="bottom">Bottom Shelf</option>
                <option value="not-present">Not Present</option>
              </select>
            </div>
          </div>
        )}

        {/* Section 1: Perfect Serve */}
        {activeSection === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg text-white font-semibold mb-4">Perfect Serve Checklist</h3>
            
            {[
              { key: 'properGlassware', label: 'Proper Glassware (Copa/Balloon)' },
              { key: 'iceQuality', label: 'Ice Quality & Size' },
              { key: 'correctGarnish', label: 'Correct Garnish (Cucumber)' },
              { key: 'premiumTonic', label: 'Premium Tonic Pairing' },
              { key: 'serveRitual', label: 'Serve Ritual Execution' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
              >
                <span className="text-slate-300">{item.label}</span>
                <button
                  onClick={() => updateField(item.key, !formData[item.key as keyof typeof formData])}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    formData[item.key as keyof typeof formData]
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700/50 text-slate-500'
                  }`}
                >
                  {formData[item.key as keyof typeof formData] ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Section 2: Materials & Signage */}
        {activeSection === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Materials & Signage</h3>
            
            {[
              { key: 'backBarSignage', label: 'Back Bar Signage' },
              { key: 'menuInserts', label: 'Menu Inserts' },
              { key: 'coasters', label: 'Coasters' },
              { key: 'tableCards', label: 'Table Cards' },
              { key: 'outdoorSignage', label: 'Outdoor Signage' },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-sm text-slate-300 mb-2">{item.label}</label>
                <select
                  value={formData[item.key as keyof typeof formData] as string}
                  onChange={(e) => updateField(item.key, e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="good">Good Condition</option>
                  <option value="present">Present</option>
                  <option value="worn">Worn/Needs Refresh</option>
                  <option value="missing">Missing</option>
                  <option value="not-applicable">Not Applicable</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Section 3: Staff & Training */}
        {activeSection === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Staff & Training</h3>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Staff Knowledge (1-10)</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.staffKnowledge}
                  onChange={(e) => updateField('staffKnowledge', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="w-12 text-center">
                  <span className="text-2xl text-amber-400 font-bold">{formData.staffKnowledge}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Certified Bartenders</label>
                <input
                  type="number"
                  value={formData.certifiedBartenders}
                  onChange={(e) => updateField('certifiedBartenders', parseInt(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Total Bartenders</label>
                <input
                  type="number"
                  value={formData.totalBartenders}
                  onChange={(e) => updateField('totalBartenders', parseInt(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Brand Advocacy Level</label>
              <select
                value={formData.brandAdvocacy}
                onChange={(e) => updateField('brandAdvocacy', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="high">High - Actively Recommends</option>
                <option value="medium">Medium - Neutral</option>
                <option value="low">Low - Prefers Competitors</option>
                <option value="none">None - No Knowledge</option>
              </select>
            </div>
          </div>
        )}

        {/* Section 4: Competition */}
        {activeSection === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Competition Analysis</h3>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Main Competitor</label>
              <input
                type="text"
                value={formData.mainCompetitor}
                onChange={(e) => updateField('mainCompetitor', e.target.value)}
                placeholder="e.g., Tanqueray, Bombay Sapphire"
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Competitor Visibility</label>
              <select
                value={formData.competitorVisibility}
                onChange={(e) => updateField('competitorVisibility', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="high">High - More Prominent</option>
                <option value="medium">Medium - Equal</option>
                <option value="low">Low - Less Prominent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Price Comparison</label>
              <select
                value={formData.priceComparison}
                onChange={(e) => updateField('priceComparison', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="premium">Premium (+$2-3)</option>
                <option value="equal">Equal Pricing</option>
                <option value="lower">Lower (-$2-3)</option>
              </select>
            </div>
          </div>
        )}

        {/* Section 5: Sales Data */}
        {activeSection === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Sales & Inventory Data</h3>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Estimated Monthly Rotation (bottles)</label>
              <input
                type="number"
                value={formData.estimatedMonthlyRotation}
                onChange={(e) => updateField('estimatedMonthlyRotation', parseInt(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Current Stock Level</label>
              <select
                value={formData.stockLevel}
                onChange={(e) => updateField('stockLevel', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="overstocked">Overstocked</option>
                <option value="adequate">Adequate</option>
                <option value="low">Low</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Out of Stock in Last 30 Days?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateField('outOfStock', true)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    formData.outOfStock
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => updateField('outOfStock', false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    !formData.outOfStock
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800/50 text-slate-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Opportunity Assessment</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trainingNeeded}
                    onChange={(e) => updateField('trainingNeeded', e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-300">Training Needed</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.materialRefresh}
                    onChange={(e) => updateField('materialRefresh', e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-300">Material Refresh Needed</span>
                </label>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-300 mb-2">Activation Potential</label>
                <select
                  value={formData.activationPotential}
                  onChange={(e) => updateField('activationPotential', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="high">High - Prime Target</option>
                  <option value="medium">Medium - Good Opportunity</option>
                  <option value="low">Low - Limited Potential</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Photos & Notes */}
        {activeSection === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg text-white font-semibold">Photos & Notes</h3>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Upload Photos</label>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 mb-1">Click to upload photos</p>
                  <p className="text-xs text-slate-500">Back bar, signage, materials, perfect serve</p>
                </label>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {formData.photos.map((photo, i) => (
                    <div key={i} className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        onClick={() => updateField('photos', formData.photos.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">General Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                placeholder="General observations, staff interactions, venue atmosphere..."
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Recommended Actions</label>
              <textarea
                value={formData.recommendedActions}
                onChange={(e) => updateField('recommendedActions', e.target.value)}
                rows={4}
                placeholder="Specific actions to improve brand presence, training recommendations, activation ideas..."
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
            onClick={() => setActiveSection(activeSection - 1)}
            className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            Previous
          </button>
        )}
        {activeSection < sections.length - 1 ? (
          <button
            onClick={() => setActiveSection(activeSection + 1)}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            Next Section
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
          >
            Submit Inspection
          </button>
        )}
      </div>
    </div>
  );
}