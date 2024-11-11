import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { errorService } from '@/services/errorService';

// Reducers
import hospitalsReducer from './slices/hospitalSlice';
import filtersReducer from './slices/filtersSlice';
import mapReducer from './slices/mapSlice';
import uiReducer from './slices/uiSlice';

// Middleware
import { rtkQueryErrorLogger } from './middleware/errorMiddleware';
import { analyticsMiddleware } from './middleware/analyticsMiddleware';
import { performanceMiddleware } from './middleware/performanceMiddleware';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['ui', 'filters'], // Only persist these reducers
  blacklist: ['map'] // Never persist these reducers
};

const persistedReducer = persistReducer(persistConfig, {
  hospitals: hospitalsReducer,
  filters: filtersReducer,
  map: mapReducer,
  ui: uiReducer
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['map.leafletMap']
      },
      thunk: {
        extraArgument: {
          errorService
        }
      }
    })
    .concat(rtkQueryErrorLogger)
    .concat(analyticsMiddleware)
    .concat(performanceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Enable listener behavior for RTK-Query
setupListeners(store.dispatch);

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Reset store function
export const resetStore = () => {
  store.dispatch({ type: 'RESET_STORE' });
};

export default store;