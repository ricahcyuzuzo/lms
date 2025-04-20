// Ensure TypeScript recognizes the module
/// <reference types="@reduxjs/toolkit" />
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './authSlice';
import leaveReducer from './leaveSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  leave: leaveReducer,
  user: userReducer, // keep user for backward compatibility
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
