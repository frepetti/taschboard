const fs = require('fs');
const path = require('path');

const managerDashboardPath = path.join(__dirname, 'components', 'ManagerDashboard.tsx');
let content = fs.readFileSync(managerDashboardPath, 'utf8');

// Generate 15 Demo Venues
const venues = [
    { id: 'v1', venue_name: 'La Terraza Premium', zone: 'Palermo', lat: -34.5689, lng: -58.4305, type: 'strategic', channel: 'On Premise' },
    { id: 'v2', venue_name: 'Bar Central', zone: 'Microcentro', lat: -34.6037, lng: -58.3756, type: 'opportunity', channel: 'Bar' },
    { id: 'v3', venue_name: 'Discoteca Eclipse', zone: 'Palermo', lat: -34.5889, lng: -58.4325, type: 'strategic', channel: 'Night Club' },
    { id: 'v4', venue_name: 'El Refugio', zone: 'San Telmo', lat: -34.6215, lng: -58.3732, type: 'opportunity', channel: 'On Premise' },
    { id: 'v5', venue_name: 'Sky Lounge BA', zone: 'Puerto Madero', lat: -34.6128, lng: -58.3615, type: 'strategic', channel: 'Premium Bar' },
    { id: 'v6', venue_name: 'Bodegón del Sur', zone: 'Boca', lat: -34.6353, lng: -58.3648, type: 'risk', channel: 'Restaurante' },
    { id: 'v7', venue_name: 'Pub Los Amigos', zone: 'Belgrano', lat: -34.5625, lng: -58.4602, type: 'opportunity', channel: 'Bar' },
    { id: 'v8', venue_name: 'Bierhaus', zone: 'Palermo', lat: -34.5800, lng: -58.4200, type: 'activated', channel: 'Cervecería' },
    { id: 'v9', venue_name: 'Café de la Plaza', zone: 'Centro', lat: -34.6087, lng: -58.3800, type: 'risk', channel: 'Café' },
    { id: 'v10', venue_name: 'Oasis Club', zone: 'Palermo', lat: -34.5900, lng: -58.4350, type: 'strategic', channel: 'Night Club' },
    { id: 'v11', venue_name: 'La Cantina', zone: 'Almagro', lat: -34.6050, lng: -58.4100, type: 'opportunity', channel: 'Restaurante' },
    { id: 'v12', venue_name: 'Sunset Bar', zone: 'Costanera Norte', lat: -34.5500, lng: -58.4000, type: 'strategic', channel: 'Premium Bar' },
    { id: 'v13', venue_name: 'El Escondite', zone: 'San Telmo', lat: -34.6150, lng: -58.3700, type: 'activated', channel: 'Bar' },
    { id: 'v14', venue_name: 'Cocktail Room', zone: 'Recoleta', lat: -34.5883, lng: -58.3963, type: 'strategic', channel: 'Premium Bar' },
    { id: 'v15', venue_name: 'Bar de Vinos', zone: 'Palermo', lat: -34.5920, lng: -58.4280, type: 'opportunity', channel: 'Bar' },
];

// Generate 60 inspections over the last 12 months
const generateInspections = () => {
  const result = [];
  const currentDate = new Date();
  
  const competitors = ['Tanqueray', 'Bombay Sapphire', 'Monkey 47', 'Aviation', 'Roku', 'Otros'];
  const presences = ['Alta', 'Media', 'Baja'];

  for (let i = 0; i < 60; i++) {
    // Random date within last 365 days
    const d = new Date(currentDate.getTime() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const dateStr = d.toISOString().split('T')[0];
    
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const compScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const bPresence = presences[Math.floor(Math.random() * 3)];
    const cPresence = presences[Math.floor(Math.random() * 3)];
    const competitor = competitors[Math.floor(Math.random() * competitors.length)];

    result.push({
      id: `insp-${i}`,
      punto_venta_id: venue.id,
      venue_name: venue.venue_name,
      fecha_inspeccion: dateStr,
      visit_date: dateStr, // legacy key
      compliance_score: compScore,
      brand_presence: bPresence,
      competitor_presence: cPresence,
      main_competitor: competitor, // legacy key mapped to competitorMap 
      tiene_producto: true,
      tiene_material_pop: bPresence !== 'Baja',
      observations: `Observación autogenerada ${i}`
    });
  }
  
  // Sort descending by date
  return result.sort((a,b) => new Date(b.fecha_inspeccion) - new Date(a.fecha_inspeccion));
};

// Generate 15 activations over the last 12 months
const generateActivations = () => {
  const result = [];
  const currentDate = new Date();
  const types = ['Completed', 'Completed', 'Completed', 'In Progress', 'Scheduled'];
  
  for (let i = 0; i < 15; i++) {
    const d = new Date(currentDate.getTime() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    result.push({
      id: `act-${i}`,
      venue: venue.venue_name,
      date: d.toISOString().split('T')[0],
      rawDate: d,
      type: type,
      impact: type === 'Completed' ? `+${Math.floor(Math.random() * 30) + 10}%` : 'TBD',
      status: type === 'Completed' ? 'success' : (type === 'In Progress' ? 'active' : 'scheduled')
    });
  }
  return result.sort((a,b) => b.rawDate - a.rawDate).map(({rawDate, ...rest}) => rest);
};

const DEMO_DATA_STRING = `const DEMO_DATA = {
  kpis: {
    visitedVenues: 642,
    visitedVenuesTrend: 18.5,
    compliance: 89.4,
    complianceTrend: 3.2,
    activations: 124,
    activationsTrend: 12.4,
    roi: 312.5,
    roiTrend: 22.1,
    totalRegisteredVenues: 850
  },
  demoVenues: ${JSON.stringify(venues, null, 4)},
  inspections: ${JSON.stringify(generateInspections(), null, 4)},
  activations: ${JSON.stringify(generateActivations(), null, 4)}
};`;

// Replace DEMO_DATA logic
const newContent = content.replace(/const DEMO_DATA = \{[\s\S]*?\};\r?\n/m, DEMO_DATA_STRING + '\n');
fs.writeFileSync(managerDashboardPath, newContent);

console.log("Updated ManagerDashboard DEMO_DATA");
