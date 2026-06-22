import { configureStore } from '@reduxjs/toolkit';
import { potterApi } from '../api/potterApi';
import { charactersReducer } from './charactersSlice';

export const createAppStore = () =>
  configureStore({
    reducer: {
      characters: charactersReducer,
      [potterApi.reducerPath]: potterApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(potterApi.middleware),
  });

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
