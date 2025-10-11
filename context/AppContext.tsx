import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Tab, Notification, NotificationType } from '../types';

interface AppContextType {
  ingestedText: string | null;
  setIngestedText: (text: string | null) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: number) => void;
  language: string;
  setLanguage: (language: string) => void;
  llm: string;
  setLlm: (llm: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingestedText, setIngestedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Ingest);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [language, setLanguage] = useState<string>('English');
  const [llm, setLlm] = useState<string>('gemini-2.5-flash');

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
        removeNotification(id);
    }, 5000); // Auto-dismiss after 5 seconds
  }, [removeNotification]);


  return (
    <AppContext.Provider
      value={{
        ingestedText,
        setIngestedText,
        activeTab,
        setActiveTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        notifications,
        addNotification,
        removeNotification,
        language,
        setLanguage,
        llm,
        setLlm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};