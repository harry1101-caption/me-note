import React, { useState } from 'react';
import { IonText, IonToggle } from '@ionic/react';
import { User, CheckCircle, Bell, Globe, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import './SettingsContent.css';

interface SettingsContentProps {
  userId?: string;
  onLanguageChange?: (language: string) => void;
  onNotificationsChange?: (enabled: boolean) => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ 
  userId = "4ecee238...", 
  onLanguageChange,
  onNotificationsChange 
}) => {
  const [language, setLanguage] = useState("English");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);


  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    onNotificationsChange?.(enabled);
  };

  return (
    <div className="settings-content">
      {/* User ID Row */}
      <div className="settings-row">
        <div className="settings-row-content">
          <User className="settings-icon" />
          <IonText className="settings-label">User ID</IonText>
        </div>
        <IonText className="settings-value">{userId}</IonText>
      </div>

      {/* Subscription Row */}
      <div className="settings-row">
        <div className="settings-row-content">
          <CheckCircle className="settings-icon" />
          <IonText className="settings-label">Subscription</IonText>
        </div>
        <IonText className="settings-value">Free Trial</IonText>
      </div>

     


      {/* Language Row */}
      <div className="settings-row">
        <div className="settings-row-content">
          <Globe className="settings-icon" />
          <IonText className="settings-label">Language</IonText>
        </div>
        <div className="settings-dropdown" onClick={() => console.log('Language dropdown clicked')}>
          <IonText className="settings-value">{language}</IonText>
          <ChevronDown className="dropdown-icon" />
        </div>
      </div>

      {/* Terms of Use Row */}
      <div className="settings-row settings-row-clickable" onClick={() => console.log('Terms of Use clicked')}>
        <div className="settings-row-content">
          <FileText className="settings-icon" />
          <IonText className="settings-label">Terms of Use</IonText>
        </div>
        <ChevronRight className="chevron-icon" />
      </div>
    </div>
  );
};

export default SettingsContent;
