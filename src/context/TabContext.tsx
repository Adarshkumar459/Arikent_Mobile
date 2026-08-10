import React, { createContext, useContext } from 'react';

interface TabContextValue {
  activeTab: string;
  switchTab: (tabKey: string) => void;
}

export const TabContext = createContext<TabContextValue>({
  activeTab: 'Home',
  switchTab: () => {},
});

export const useTabNav = () => useContext(TabContext);
