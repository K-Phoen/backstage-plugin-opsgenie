import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage/MainPage';
import { rootRouteRef } from './plugin';

export const Router = () => (
  <Routes>
    <Route path={`/${rootRouteRef.path}`} element={<MainPage />} />
  </Routes>
);