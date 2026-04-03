// context/PageTitleContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';

const PageTitleContext = createContext({
  title: '',
  setTitle: (_title: string) => {},
});

export const usePageTitle = () => useContext(PageTitleContext);

export const PageTitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState('');
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};
