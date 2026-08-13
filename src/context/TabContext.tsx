import React, { createContext, useContext } from 'react';

export interface TabContextType {
  activeTab: string;
  resetSignal: number;
  switchTab: (tabKey: string) => void;
}

export const TabContext = createContext<TabContextType>({
  activeTab: 'Home',
  resetSignal: 0,
  switchTab: () => {},
});

export const useTabNav = () => useContext(TabContext);
