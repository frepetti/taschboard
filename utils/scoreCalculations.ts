import { SCORE_CONFIG } from './scoreConfig';

// Interfaces for input data
interface InspectionData {
    staffKnowledge?: number; // 1-10
    certifiedBartenders?: number;
    totalBartenders?: number;
    brandAdvocacy?: string; // High, Medium, Low

    // Visibility
    backBarVisibility?: string; // prominent, visible, hidden, not-present
    shelfPosition?: string; // top, middle, bottom

    // POP
    tiene_material_pop?: boolean;
    pos_materials?: string[]; // Array of materials

    // Stock
    stockLevel?: string; // adequate, low, critical
}

export const calculateKnowledgeScore = (data: InspectionData): number => {
    // K1: Nivel de Conocimiento (1-10 -> 10-100)
    const k1 = (data.staffKnowledge || 0) * 10;

    // K2: % Bartenders Capacitados
    let k2 = 0;
    if (data.totalBartenders && data.totalBartenders > 0) {
        k2 = ((data.certifiedBartenders || 0) / data.totalBartenders) * 100;
    }

    // K3: Brand Advocacy
    let k3 = 0;
    const advocacy = (data.brandAdvocacy || '').toLowerCase();
    if (advocacy === 'high' || advocacy === 'alta') k3 = 100;
    else if (advocacy === 'medium' || advocacy === 'media') k3 = 50;
    else if (advocacy === 'low' || advocacy === 'baja') k3 = 0;

    // Formula: (K1 * 0.4) + (K2 * 0.4) + (K3 * 0.2)
    return Math.round((k1 * 0.4) + (k2 * 0.4) + (k3 * 0.2));
};

export const calculateVisibilityScore = (data: InspectionData): number => {
    let score = 0;

    // 1. Back Bar Visibility (60%)
    const visibility = (data.backBarVisibility || '').toLowerCase();
    if (visibility === 'prominent' || visibility === 'destacado') score += 60;
    else if (visibility === 'visible') score += 40;
    else if (visibility === 'hidden' || visibility === 'oculto') score += 10;

    // 2. Shelf Position (40%)
    const position = (data.shelfPosition || '').toLowerCase();
    if (position === 'top' || position === 'superior') score += 40;
    else if (position === 'middle' || position === 'medio') score += 20;
    else if (position === 'bottom' || position === 'inferior') score += 5;

    return Math.min(100, score);
};

export const calculatePOPScore = (data: InspectionData): number => {
    // Simple logic: presence + quantity
    if (!data.tiene_material_pop && (!data.pos_materials || data.pos_materials.length === 0)) return 0;

    let score = 50; // Base if present
    const count = data.pos_materials?.length || 0;

    // Add 10 points per item, up to 50 more
    score += Math.min(50, count * 10);

    return score;
};

export const calculateStockScore = (data: InspectionData): number => {
    const stock = (data.stockLevel || '').toLowerCase();

    if (stock === 'adequate' || stock === 'adecuado') return 100;
    if (stock === 'low' || stock === 'bajo') return 50;
    if (stock === 'critical' || stock === 'crítico' || stock === 'out' || stock === 'sin stock') return 0;

    return 0; // Default
};

export const calculateGlobalScore = (data: InspectionData) => {
    const visScore = calculateVisibilityScore(data);
    const popScore = calculatePOPScore(data);
    const stockScore = calculateStockScore(data);
    const knowScore = calculateKnowledgeScore(data);

    const w = SCORE_CONFIG.weights;

    const globalScore = Math.round(
        (visScore * w.visibility) +
        (popScore * w.pop) +
        (stockScore * w.stock) +
        (knowScore * w.knowledge)
    );

    return {
        globalScore,
        breakdown: {
            visibility: visScore,
            pop: popScore,
            stock: stockScore,
            knowledge: knowScore
        }
    };
};

export const calculateVenueStatus = (globalScore: number) => {
    const t = SCORE_CONFIG.thresholds;

    if (globalScore >= t.strategic.min) return { status: 'strategic', ...t.strategic };
    if (globalScore >= t.opportunity.min) return { status: 'opportunity', ...t.opportunity };
    return { status: 'risk', ...t.risk };
};
