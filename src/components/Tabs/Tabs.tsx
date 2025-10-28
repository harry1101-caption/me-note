import React, { useState, useRef, useEffect } from 'react';
import './Tabs.css';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  value?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'pill' | 'compact';
  fullWidth?: boolean;
  disabled?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  value: controlledValue,
  onChange,
  className = '',
  size = 'medium',
  variant = 'pill',
  fullWidth = false,
  disabled = false,
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultTab || tabs[0]?.id);
  const value = isControlled ? controlledValue : internalValue;

  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Position indicator
  const updateIndicator = () => {
    if (indicatorRef.current && tabsRef.current) {
      const activeTab = tabsRef.current.querySelector(`[data-tab-id="${value}"]`) as HTMLElement;
      if (activeTab) {
        const containerRect = tabsRef.current.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        const left = activeRect.left - containerRect.left;
        indicatorRef.current.style.transform = `translateX(${left}px)`;
        indicatorRef.current.style.width = `${activeRect.width}px`;
        indicatorRef.current.style.opacity = '1';
      } else {
        // Hide indicator if no active tab found
        if (indicatorRef.current) {
          indicatorRef.current.style.opacity = '0';
        }
      }
    }
  };

  // Update indicator on tab change + resize
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateIndicator, 0);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [value, tabs]);

  const handleTabClick = (tabId: string) => {
    if (disabled) return;
    if (!isControlled) setInternalValue(tabId);
    onChange?.(tabId);
  };

  const sizeClass = `tabs-size-${size}`;
  const variantClass = `tabs-variant-${variant}`;
  const fullWidthClass = fullWidth ? 'tabs-full-width' : '';
  const disabledClass = disabled ? 'tabs-disabled' : '';
  const fullClassName = `tabs ${sizeClass} ${variantClass} ${fullWidthClass} ${disabledClass} ${className}`.trim();

  return (
    <div className={fullClassName} ref={tabsRef}>
      <div className="tabs-container">
        {tabs.map((tab) => {
          const isActive = value === tab.id;
          const tabClass = `tab ${isActive ? 'tab-active' : ''}`.trim();

          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              className={tabClass}
              onClick={() => handleTabClick(tab.id)}
              disabled={disabled}
            >
              <span className="tab-content">
                {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                <span className="tab-label">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="tab-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
                )}
              </span>
            </button>
          );
        })}
        {variant === 'pill' && <div className="tabs-indicator" ref={indicatorRef} />}
      </div>
    </div>
  );
};

export default Tabs;
