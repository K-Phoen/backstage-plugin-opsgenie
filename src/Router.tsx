import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AlertsPage from './components/AlertsPage/AlertsPage';
import { rootRouteRef } from './plugin';

export const Router = () => (
  <Routes>
    <Route path={`/${rootRouteRef.path}`} element={<AlertsPage />} />
  </Routes>
);