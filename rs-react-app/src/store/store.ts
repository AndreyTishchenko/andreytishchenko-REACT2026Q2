import { configureStore } from '@reduxjs/toolkit';
import { charactersReducer } from './charactersSlice';

export const createAppStore = () =>
  configureStore({
    reducer: {
      characters: charactersReducer,
    },
  });

export const store = createAppStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
