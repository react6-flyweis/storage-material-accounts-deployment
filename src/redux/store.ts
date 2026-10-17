import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authApi } from "./api/authApi";
import { customerApi } from "./api/customerApi";
import { dashboardApi } from "./api/dashboardApi";
import { paymentsApi } from "./api/paymentsApi";
import { paymentApprovalsApi } from "./api/paymentApprovalsApi";
import { notificationsApi } from "./api/notificationsApi";
import { teamChatApi } from "./api/teamChatApi";
import { customerDirectChatApi } from "./api/customerDirectChatApi";
import { projectApi } from "./api/projectApi";
import { marginAnalysisApi } from "./api/marginAnalysisApi";
import { financialApi } from "./api/financialApi";
import { reportsApi } from "./api/reportsApi";
import { costsApi } from "./api/costsApi";
import { deliveriesApi } from "./api/deliveriesApi";
import { invoiceManagementApi } from "./api/invoiceManagementApi";
import authReducer from "./slices/authSlice";
import inventoryReducer from "./slices/inventorySlice";
import maintenanceReducer from "./slices/maintenanceSlice";

const authPersistConfig = {
  key: "sm-accounts-auth",
  storage,
  whitelist: ["user", "accessToken", "refreshToken", "role", "isAuthenticated"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    inventory: inventoryReducer,
    maintenance: maintenanceReducer,
    [authApi.reducerPath]: authApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [paymentApprovalsApi.reducerPath]: paymentApprovalsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [teamChatApi.reducerPath]: teamChatApi.reducer,
    [customerDirectChatApi.reducerPath]: customerDirectChatApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [marginAnalysisApi.reducerPath]: marginAnalysisApi.reducer,
    [financialApi.reducerPath]: financialApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [costsApi.reducerPath]: costsApi.reducer,
    [deliveriesApi.reducerPath]: deliveriesApi.reducer,
    [invoiceManagementApi.reducerPath]: invoiceManagementApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/FLUSH",
          "persist/REGISTER",
        ],
      },
    }).concat(
      authApi.middleware,
      customerApi.middleware,
      dashboardApi.middleware,
      paymentsApi.middleware,
      paymentApprovalsApi.middleware,
      notificationsApi.middleware,
      teamChatApi.middleware,
      customerDirectChatApi.middleware,
      projectApi.middleware,
      marginAnalysisApi.middleware,
      financialApi.middleware,
      reportsApi.middleware,
      costsApi.middleware,
      deliveriesApi.middleware,
      invoiceManagementApi.middleware
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
