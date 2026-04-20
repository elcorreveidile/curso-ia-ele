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

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <CourseCtx.Provider value={{ course, refresh }}>
      {children}
    </CourseCtx.Provider>
  );
}

export const useCourse = () => useContext(CourseCtx) || { course: null, refresh: () => {} };
