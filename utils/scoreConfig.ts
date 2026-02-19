export const SCORE_CONFIG = {
    weights: {
        visibility: 0.4,
        pop: 0.3,
        stock: 0.2,
        knowledge: 0.1
    },
    thresholds: {
        strategic: { min: 85, color: "#2ecc71", label: "Estratégico" },
        opportunity: { min: 60, color: "#f1c40f", label: "Oportunidad" },
        risk: { min: 0, color: "#e74c3c", label: "Riesgo" }
    }
};

export type CategoryKey = keyof typeof SCORE_CONFIG.thresholds;
