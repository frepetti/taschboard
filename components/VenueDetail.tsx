import { ArrowLeft, MapPin, Phone, Globe, Check, X, AlertTriangle, TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { toast } from 'sonner';

interface Venue {
  id: number;
  name: string;
  image: string;
  channel: string;
  brandPresence: number;
  perfectServe: number;
  materialStatus: string;
  shareOfMenu: number;
  competitor: string;
}

interface VenueDetailProps {
  venue: Venue;
  onBack: () => void;
}

export function VenueDetail({ venue, onBack }: VenueDetailProps) {
  const venueImages = [
    'https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1739203852867-87038459791a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJ0ZW5kZXIlMjBwb3VyaW5nJTIwY29ja3RhaWx8ZW58MXx8fHwxNzY3NzMwODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1763196080531-f282d0d4e6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXIlMjBnbGFzc3dhcmUlMjBkaXNwbGF5fGVufDF8fHx8MTc2NzczMDgwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1600988718520-3f5814892d5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFmdCUyMGNvY2t0YWlsfGVufDF8fHx8MTc2NzcxMTEzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  const perfectServeChecklist = [
    { item: 'Proper glassware (Copa/Balloon)', status: true },
    { item: 'Ice quality & size', status: true },
    { item: 'Correct garnish (cucumber)', status: true },
    { item: 'Premium tonic pairing', status: true },
    { item: 'Serve ritual execution', status: true },
  ];

  const competitorData = [
    { brand: "Hendrick's", value: venue.shareOfMenu },
    { brand: venue.competitor, value: 19 },
    { brand: 'Bombay Sapphire', value: 15 },
    { brand: 'Others', value: 100 - venue.shareOfMenu - 19 - 15 },
  ];

  const [_showRecommendations, _setShowRecommendations] = useState(false);
  const [showBTLModal, setShowBTLModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 sm:py-8">
        {/* Venue Header */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-8 shadow-xl mb-4 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl text-white font-bold mb-3 sm:mb-4">{venue.name}</h1>

              {/* Contact Info - Stacked on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Lower East Side, Manhattan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span>(212) 555-0123</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-amber-400 hover:underline cursor-pointer truncate">thedeadrabbit.com</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-slate-700/50 text-slate-300 border border-slate-600/50">
                  {venue.channel}
                </span>
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-green-500/20 text-green-400 border border-green-500/30">
                  Premium Tier
                </span>
              </div>
            </div>

            {/* Opportunity Score - Smaller on mobile */}
            <div className="flex items-center gap-4 lg:flex-col lg:text-right lg:items-end">
              <div className="flex-1 lg:flex-initial">
                <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Opportunity Score</div>
                <div className="text-4xl sm:text-6xl text-amber-400 font-bold">9.2</div>
                <div className="text-xs sm:text-sm text-slate-400">out of 10</div>
              </div>
              <button
                className="shrink-0 lg:w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-lg shadow-amber-500/20"
                onClick={() => setShowBTLModal(true)}
              >
                Create BTL Action
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Left Column - Photos & Checklist */}
          <div className="space-y-4 sm:space-y-6">
            {/* Photo Gallery */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">Venue Gallery</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {venueImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Venue ${i + 1}`}
                    className="w-full h-24 sm:h-40 object-cover rounded-lg border border-slate-700/50 hover:border-amber-500/50 transition-colors cursor-pointer"
                  />
                ))}
              </div>
            </div>

            {/* Perfect Serve Checklist */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">Perfect Serve Checklist</h3>
              <div className="space-y-2 sm:space-y-3">
                {perfectServeChecklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <span className="text-slate-300 text-xs sm:text-sm flex-1 mr-2">{item.item}</span>
                    {item.status ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shrink-0">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shrink-0">
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-400">Compliance Score</span>
                  <span className="text-xl sm:text-2xl text-green-400 font-bold">{venue.perfectServe}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - KPIs & Analysis */}
          <div className="space-y-4 sm:space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-6 shadow-xl">
                <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Brand Presence</div>
                <div className="text-2xl sm:text-3xl text-green-400 font-bold">{venue.brandPresence}</div>
                <div className="text-[10px] sm:text-xs text-green-400 mt-0.5 sm:mt-1">+5 vs last month</div>
              </div>
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-6 shadow-xl">
                <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Share of Menu</div>
                <div className="text-2xl sm:text-3xl text-amber-400 font-bold">{venue.shareOfMenu}%</div>
                <div className="text-[10px] sm:text-xs text-amber-400 mt-0.5 sm:mt-1">2nd highest</div>
              </div>
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-6 shadow-xl">
                <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Avg. Rotation</div>
                <div className="text-2xl sm:text-3xl text-white font-bold">142</div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">bottles/month</div>
              </div>
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-6 shadow-xl">
                <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">Revenue Impact</div>
                <div className="text-2xl sm:text-3xl text-white font-bold">$18.5K</div>
                <div className="text-[10px] sm:text-xs text-green-400 mt-0.5 sm:mt-1">+12% YoY</div>
              </div>
            </div>

            {/* Qualitative Notes */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">Qualitative Notes</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-white font-medium mb-1">Strong Bartender Advocacy</div>
                      <div className="text-[10px] sm:text-xs text-slate-400">Head bartender Sean actively recommends Hendrick's for custom cocktails. 3 signature drinks on menu.</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-white font-medium mb-1">Material Refresh Needed</div>
                      <div className="text-[10px] sm:text-xs text-slate-400">Back-bar signage is outdated. Recommend replacing with new seasonal campaign materials.</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-white font-medium mb-1">Prime Location</div>
                      <div className="text-[10px] sm:text-xs text-slate-400">Featured on World's 50 Best Bars list. High-profile clientele and influencer presence.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitor Comparison */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">Venue Share of Menu</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={competitorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="brand"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-amber-950/30 via-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 sm:p-8 shadow-2xl">
          <h2 className="text-xl sm:text-2xl text-white font-semibold mb-4 sm:mb-6">Recommended Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">🎯</span>
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Premium Tasting Event</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">Host exclusive Hendrick's Orbium tasting for VIP guests. Expected lift: +25%</p>
              <div className="text-[10px] sm:text-xs text-slate-500">Investment: $2,800</div>
            </div>
            <div className="p-4 sm:p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">📚</span>
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Bartender Certification</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">Train 2 additional bartenders on Perfect Serve protocol. Maintain consistency.</p>
              <div className="text-[10px] sm:text-xs text-slate-500">Investment: $500</div>
            </div>
            <div className="p-4 sm:p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">📸</span>
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Social Media Partnership</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">Co-create signature cocktail content for Instagram. Leverage venue's 85K followers.</p>
              <div className="text-[10px] sm:text-xs text-slate-500">Investment: $1,200</div>
            </div>
          </div>
        </div>
      </main>

      {/* BTL Action Modal */}
      {showBTLModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border-b border-amber-500/30 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl text-white font-bold">Create BTL Action</h2>
                <button
                  onClick={() => setShowBTLModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-slate-300 mt-2">Plan and schedule a new Below-The-Line activation for {venue.name}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Action Type */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Action Type</label>
                <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors">
                  <option>Tasting Event</option>
                  <option>Bartender Training</option>
                  <option>Material Refresh</option>
                  <option>Social Media Campaign</option>
                  <option>Promotional Offer</option>
                  <option>Brand Activation</option>
                </select>
              </div>

              {/* Action Name */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Action Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hendrick's Premium Tasting Experience"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Date & Budget Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="2800"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Expected Attendees */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Expected Attendees
                </label>
                <input
                  type="number"
                  placeholder="50"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Description & Goals</label>
                <textarea
                  rows={4}
                  placeholder="Describe the activation plan, objectives, and expected outcomes..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Expected Impact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Expected Sales Lift (%)</label>
                  <input
                    type="number"
                    placeholder="25"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Expected ROI (%)</label>
                  <input
                    type="number"
                    placeholder="150"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Approval Required */}
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="approval"
                  className="w-5 h-5 rounded border-amber-500 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="approval" className="text-sm text-slate-300">
                  Requires client approval before execution
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700/50 p-6 flex gap-4">
              <button
                onClick={() => setShowBTLModal(false)}
                className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBTLModal(false);
                  // TODO: Save to Supabase
                  toast.success('BTL Action saved!', {
                    description: 'Demo mode - action would be saved to database'
                  });
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/20"
              >
                Create Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}