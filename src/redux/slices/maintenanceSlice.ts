import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface MaintenanceRecord {
  id: number;
  equipment: string;
  reportedOn: string;
  issue: string;
  severity: string;
  severityColor: string;
  status: string;
  assignedTo: string;
}

interface ServiceProvider {
  id: number;
  providerName: string;
  services: string;
  contact: string;
  rating: number;
  avgCost: string;
  lastService: string;
}

interface MaintenanceState {
  breakdownCases: MaintenanceRecord[];
  upcomingSchedule: MaintenanceRecord[];
  serviceProviders: ServiceProvider[];
  loading: boolean;
  error: string | null;
  stats: {
    totalEquipment: number;
    breakdownCases: number;
    maintenanceDueThisWeek: number;
    overdueMaintenance: number;
  };
}

const initialState: MaintenanceState = {
  breakdownCases: [],
  upcomingSchedule: [],
  serviceProviders: [],
  loading: false,
  error: null,
  stats: {
    totalEquipment: 128,
    breakdownCases: 42,
    maintenanceDueThisWeek: 74,
    overdueMaintenance: 12,
  },
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    setBreakdownCases: (state, action: PayloadAction<MaintenanceRecord[]>) => {
      state.breakdownCases = action.payload;
    },
    addBreakdownCase: (state, action: PayloadAction<MaintenanceRecord>) => {
      state.breakdownCases.push(action.payload);
    },
    updateBreakdownCase: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<MaintenanceRecord> }>
    ) => {
      const index = state.breakdownCases.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.breakdownCases[index] = {
          ...state.breakdownCases[index],
          ...action.payload.updates,
        };
      }
    },
    setUpcomingSchedule: (
      state,
      action: PayloadAction<MaintenanceRecord[]>
    ) => {
      state.upcomingSchedule = action.payload;
    },
    setServiceProviders: (state, action: PayloadAction<ServiceProvider[]>) => {
      state.serviceProviders = action.payload;
    },
    addServiceProvider: (state, action: PayloadAction<ServiceProvider>) => {
      state.serviceProviders.push(action.payload);
    },
    updateStats: (
      state,
      action: PayloadAction<Partial<MaintenanceState["stats"]>>
    ) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBreakdownCases,
  addBreakdownCase,
  updateBreakdownCase,
  setUpcomingSchedule,
  setServiceProviders,
  addServiceProvider,
  updateStats,
  setLoading,
  setError,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
