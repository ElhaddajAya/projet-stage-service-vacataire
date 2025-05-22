 // src/components/PageLayout.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    let title = 'React App'; // Default title
    if (location.pathname === '/login') {
      title = 'Espace ESTS Admin-Vacataire';
    } else if (location.pathname.startsWith('/espace-vacataire')) {
      title = 'Espace Vacataire';
    } else if (location.pathname.startsWith('/espace-admin')) {
      title = 'Espace Admin';
    }
    document.title = title;
  }, [location]);

  return <>{children}</>;
};

export default PageLayout;