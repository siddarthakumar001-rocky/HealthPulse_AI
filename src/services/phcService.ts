import api from './api';

export interface PHCFacility {
  _id: string;
  name: string;
  facilityCode: string;
  type: 'Sub-Centre' | 'PHC' | 'CHC' | 'District Hospital';
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  bedCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  staffCount: number;
  staffOnDuty: number;
  status: 'Optimal' | 'Warning' | 'Critical' | 'Outbreak' | 'Offline';
  networkHealthScore: number;
  subScores: {
    medicineAvailability: number;
    patientCapacity: number;
    equipmentAvailability: number;
    staffAvailability: number;
    coldChainStability: number;
    outbreakRiskScore: number;
  };
  connectivity: {
    isOnline: boolean;
    lastSync: string;
    pendingSyncRecords: number;
  };
  chiefMedicalOfficer?: string;
  contactNumber?: string;
}

export interface InventoryItem {
  _id: string;
  phcId: PHCFacility | string;
  medicineName: string;
  category: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  safeBufferThreshold: number;
  dailyBurnRate: number;
  expiryDate: string;
  coldChainRequired: boolean;
  storageTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  iotTagId: string;
  stockHealth: 'Normal' | 'Low' | 'Critical' | 'Expired' | 'Excess';
  estimatedDepletionDate?: string;
  confidenceScore?: number;
  aiPrediction?: {
    forecastedDailyDemand: number;
    demand7Days: number;
    demand30Days: number;
    stockoutRisk: string;
    estimatedDepletionWindow: string;
    confidence: number;
    confidenceInterval: {
      dailyLow: number;
      dailyHigh: number;
    };
  };
}

export interface NetworkKPIs {
  totalFacilities: number;
  connectedFacilities: number;
  networkHealthScore: number;
  criticalAlerts: number;
  atRiskStockouts: number;
  potentialOutbreaks: number;
  coldChainBreaches: number;
  equipmentUptime: number;
  pendingTransfers: number;
}

export interface PHCAlertItem {
  _id: string;
  phcId: PHCFacility;
  alertType: 'STOCKOUT_RISK' | 'OUTBREAK_SURGE' | 'COLD_CHAIN_BREACH' | 'EQUIPMENT_FAILURE' | 'CAPACITY_OVERLOAD' | 'EXPIRY_WARNING' | 'CONNECTIVITY_LOSS';
  severity: 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  triggerSource: string;
  aiConfidence: number;
  recommendedAction?: string;
  status: 'Detected' | 'Prioritized' | 'Assigned' | 'Acknowledged' | 'Action Taken' | 'Resolved';
  createdAt: string;
}

export interface RedistributionRec {
  sourcePHC: PHCFacility;
  targetPHC: PHCFacility;
  resourceName: string;
  batchNumber?: string;
  transferQuantity: number;
  unit: string;
  distanceKm: number;
  surplusAvailable: number;
  donorRemainingStockAfterTransfer: number;
  aiScore: number;
  urgencyLevel: string;
  transportTimeEst: string;
  reasoning: string;
}

export interface ActiveTransfer {
  _id: string;
  sourcePHC: { _id: string; name: string; facilityCode: string; district?: string };
  targetPHC: { _id: string; name: string; facilityCode: string; district?: string };
  resourceName: string;
  quantity: number;
  unit: string;
  urgencyLevel: string;
  distanceKm: number;
  aiRecommendationScore: number;
  aiReasoning: string;
  status: 'Recommended' | 'Pending Approval' | 'Approved' | 'In Transit' | 'Completed' | 'Rejected' | 'Cancelled';
  createdAt: string;
  approvedBy?: string;
}

export const phcService = {
  // 1. Network Overview
  async getNetworkOverview(): Promise<{ success: boolean; data: { kpis: NetworkKPIs; facilities: PHCFacility[]; recentAlerts: PHCAlertItem[] } }> {
    return api.get('/phc/network-overview') as any;
  },

  // 2. Facilities
  async getFacilities(params?: { lat?: number; lng?: number; lon?: number; radius?: number }): Promise<{ success: boolean; data: PHCFacility[] }> {
    return api.get('/phc/facilities', { params }) as any;
  },

  async getFacilityById(phcId: string): Promise<{ success: boolean; data: PHCFacility }> {
    return api.get(`/phc/facilities/${phcId}`) as any;
  },

  // 3. Inventory
  async getInventory(phcId?: string): Promise<{ success: boolean; data: InventoryItem[] }> {
    const url = phcId ? `/phc/inventory/${phcId}` : '/phc/inventory';
    return api.get(url) as any;
  },

  async updateInventoryIoT(payload: { deviceId?: string; phcId: string; medicineId?: string; value: number; temperature?: number; unit?: string }) {
    return api.post('/phc/inventory/iot-update', payload);
  },

  // 4. Footfall & Predictions
  async getFootfall(phcId?: string) {
    const url = phcId ? `/phc/footfall/${phcId}` : '/phc/footfall';
    return api.get(url);
  },

  async getPredictions(phcId: string) {
    return api.get(`/phc/predictions/${phcId}`);
  },

  // 5. Alerts
  async getAlerts(params?: { severity?: string; status?: string }) {
    return api.get('/phc/alerts', { params });
  },

  async getOutbreakAlerts() {
    return api.get('/phc/outbreak-alerts');
  },

  async acknowledgeAlert(alertId: string, userName?: string) {
    return api.patch(`/phc/alerts/${alertId}/acknowledge`, { userName });
  },

  async resolveAlert(alertId: string, resolutionNotes?: string, userName?: string) {
    return api.patch(`/phc/alerts/${alertId}/resolve`, { resolutionNotes, userName });
  },

  // 6. Redistribution & Logistics
  async getRedistributionRecommendations(): Promise<{ success: boolean; data: { aiRecommendations: RedistributionRec[]; activeTransfers: ActiveTransfer[] } }> {
    return api.get('/phc/redistribution/recommendations') as any;
  },

  async createTransfer(payload: {
    sourcePHCId: string;
    targetPHCId: string;
    resourceName: string;
    quantity: number;
    urgencyLevel?: string;
    distanceKm?: number;
    aiScore?: number;
    aiReasoning?: string;
  }) {
    return api.post('/phc/redistribution/transfer', payload);
  },

  async approveTransfer(transferId: string, payload: { action: 'APPROVE' | 'DISPATCH' | 'RECEIVE'; approvedBy?: string }) {
    return api.patch(`/phc/redistribution/${transferId}/approve`, payload);
  },

  // 7. Digital Twin
  async getDigitalTwin(phcId: string) {
    return api.get(`/phc/digital-twin/${phcId}`);
  },

  // 8. Emergency Simulation Engine
  async triggerSimulation(scenario: string, facilityCode?: string) {
    return api.post(`/phc/simulate/${scenario}`, { facilityCode });
  },

  // 9. Offline Sync
  async syncOfflineQueue(facilityCode: string, records: any[]) {
    return api.post('/phc/sync-offline', { facilityCode, records });
  }
};
