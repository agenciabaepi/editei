"use client";

import { createContext, useContext, ReactNode } from 'react';
import { Page, PageManagerState, PageManagerActions } from '@/features/editor/types/page';

interface PageContextType extends PageManagerState, PageManagerActions {}

const PageContext = createContext<PageContextType | null>(null);

interface PageProviderProps {
  children: ReactNode;
  value: PageContextType;
}

export const PageProvider = ({ children, value }: PageProviderProps) => {
  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    return null; // Return null if no context (single page mode)
  }
  return context;
};
