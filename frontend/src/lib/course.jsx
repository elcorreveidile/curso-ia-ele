import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';

const CourseCtx = createContext(null);

export function CourseProvider({ children }) {
  const [course, setCourse] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const r = await api.get('/courses/ia-ele');
      setCourse(r.data);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    // Live refresh: every 60s pull the latest seats count so any
    // student inscription elsewhere is reflected without a page reload.
    const id = setInterval(refresh, 60_000);
    // Refresh when user comes back from another tab (they might have
    // completed checkout in parallel)
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh]);

  return (
    <CourseCtx.Provider value={{ course, refresh }}>
      {children}
    </CourseCtx.Provider>
  );
}

export const useCourse = () => useContext(CourseCtx) || { course: null, refresh: () => {} };
