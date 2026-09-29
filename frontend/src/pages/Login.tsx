import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Login component has been deprecated and removed.
 * Attendees access registrations directly through /my-portal.
 */
export const Login: React.FC = () => {
  return <Navigate to="/my-portal" replace />;
};

export default Login;
