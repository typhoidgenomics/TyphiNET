import { configureStore } from '@reduxjs/toolkit';
import deashboardReducer from './slices/dashboardSlice';
import mapReducer from './slices/mapSlice';
import graphReducer from './slices/graphSlice';

export const store = configureStore({
  reducer: {
    dashboard: deashboardReducer,
    map: mapReducer,
    graph: graphReducer
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false
    });
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
