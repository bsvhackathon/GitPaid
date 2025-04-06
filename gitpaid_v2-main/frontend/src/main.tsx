import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BountyDashboardView from './BountyDashboardView';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BountyDashboardView />
  </StrictMode>
);
