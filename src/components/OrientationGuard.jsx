import React, { useState, useEffect } from 'react';

/**
 * OrientationGuard - Mobile-First Component
 * 
 * UPDATED: Allows portrait mode on mobile devices (as intended)
 * Only blocks landscape on very small viewports if needed
 */
const OrientationGuard = ({ children }) => {
  // Just render children without blocking
  // Mobile portrait is the default and correct mode
  return <>{children}</>;
};

export default OrientationGuard;
