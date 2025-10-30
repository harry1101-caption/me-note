import React, { useState, useEffect } from 'react';
import { IonText } from '@ionic/react';
import { User, CheckCircle, Globe, FileText, ChevronRight, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
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
  const { t, i18n } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [anonymousToken, setAnonymousToken] = useState<string>("");

  // Language options with flag emojis
  const languages = [
    { code: 'en', name: t('languages.en'), flag: '🇬🇧' },
    { code: 'vi', name: t('languages.vi'), flag: '🇻🇳' }
  ];

  // Get anonymous token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('anonymous-token') || '';
    setAnonymousToken(token);
  }, []);

  // Truncate token if too long (keep first 8 and last 4 characters)
  const getDisplayToken = (token: string): string => {
    if (token.length <= 12) return token;
    return `${token.slice(0, 8)}...${token.slice(-4)}`;
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    onNotificationsChange?.(enabled);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('app-language', languageCode);
    onLanguageChange?.(languageCode);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  return (
    <div className="settings-content">
      {/* User ID Row */}
      <div className="settings-row">
        <div className="settings-row-content">
          <User className="settings-icon" />
          <IonText className="settings-label">{t('settings.userId')}</IonText>
        </div>
        <IonText className="settings-value">{getDisplayToken(anonymousToken)}</IonText>
      </div>

      {/* Subscription Row */}
      <div className="settings-row">
        <div className="settings-row-content">
          <CheckCircle className="settings-icon" />
          <IonText className="settings-label">{t('settings.subscription')}</IonText>
        </div>
        <IonText className="settings-value">{t('settings.freeTrial')}</IonText>
      </div>

      {/* Language Row */}
      <div className="settings-row">
        <div className="settings-row-content">
          <Globe className="settings-icon" />
          <IonText className="settings-label">{t('settings.language')}</IonText>
        </div>
        <Menu
          menuButton={
            <MenuButton className="settings-dropdown-button">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getCurrentLanguage().flag}</span>
                <IonText className="settings-value">{getCurrentLanguage().name}</IonText>
                <ChevronDown className="dropdown-icon" />
              </div>
            </MenuButton>
          }
          position="anchor"
          align="end"
          direction="bottom"
          viewScroll="close"
          portal={true}
        >
          {languages.map((lang) => (
            <MenuItem 
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '150px' }}>
                <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.name}</span>
                {i18n.language === lang.code && <Check size={18} color="var(--ion-color-primary)" />}
              </div>
            </MenuItem>
          ))}
        </Menu>
      </div>

      {/* Terms of Use Row */}
      <div className="settings-row settings-row-clickable" onClick={() => console.log('Terms of Use clicked')}>
        <div className="settings-row-content">
          <FileText className="settings-icon" />
          <IonText className="settings-label">{t('settings.termsOfUse')}</IonText>
        </div>
        <ChevronRight className="chevron-icon" />
      </div>
    </div>
  );
};

export default SettingsContent;
