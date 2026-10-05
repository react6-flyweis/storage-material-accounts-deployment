import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface InventoryItem {
  material: string;
  currentStock: number;
  unit: string;
  minLevel: number;
  status: string;
  action: string;
  actionType: string;
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  filters: {
    searchTerm: string;
    status: string | null;
  };
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    searchTerm: "",
    status: null,
  },
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setInventoryItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    addInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload);
    },
    updateInventoryItem: (
      state,
      action: PayloadAction<{ index: number; item: InventoryItem }>
    ) => {
      state.items[action.payload.index] = action.payload.item;
    },
    deleteInventoryItem: (state, action: PayloadAction<number>) => {
      state.items.splice(action.payload, 1);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.status = action.payload;
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
  setInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  setSearchTerm,
  setStatusFilter,
  setLoading,
  setError,
} = inventorySlice.actions;

export default inventorySlice.reducer;
