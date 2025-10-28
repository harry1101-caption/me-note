import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from '../Button/Button';
import './SheetModal.css';

type SheetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: React.ReactNode;
  headerContent?: React.ReactNode;
  showCTA?: boolean;
  primaryCTAText?: string;
  secondaryCTAText?: string;
  onPrimaryCTA?: () => void;
  onSecondaryCTA?: () => void;
  className?: string;
  height?: string;
  showHeader?: boolean;
}

function SheetModal({ 
  isOpen, 
  onClose, 
  title, 
  content,
  headerContent,
  showCTA = false,
  primaryCTAText = 'Save',
  secondaryCTAText = 'Cancel',
  onPrimaryCTA,
  onSecondaryCTA,
  className = '',
  height = '50vh',
  showHeader = true
}: SheetModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isClosing]);

  if (!isOpen) return null;

  return (
    <div className={`sheet-modal-overlay ${isClosing ? 'closing' : ''} ${className}`} onClick={handleClose}>
      <div 
        className={`sheet-modal ${isClosing ? 'closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        style={{ height }}
      >
        {/* Drag Handle */}
        {showHeader && <div className="sheet-drag-handle"></div>}
        
        {/* Header */}
        {showHeader && (
          <div className="sheet-header">
            {headerContent ? (
              <>
                <div style={{ width: '40px' }}></div>
                <div className="sheet-header-center">
                  {headerContent}
                </div>
                <div style={{ width: '40px' }}></div>
              </>
            ) : (
              <>
                <div className="sheet-header-left">
                  <h2 className="sheet-title">{title || 'Modal'}</h2>
                </div>
                <div style={{ width: '40px' }}></div>
              </>
            )}
            <button 
              className="sheet-close-btn" 
              onClick={handleClose}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        )}
        
        {/* Content */}
        {content && (
          <div className="sheet-content">
            {content}
          </div>
        )}
        
        {/* Footer */}
        {showCTA && (
          <div className="sheet-footer">
            <Button 
              variant="secondary"
              size="medium"
              onClick={onSecondaryCTA || handleClose}
            >
              {secondaryCTAText}
            </Button>
            <Button 
              variant="primary"
              size="medium"
              onClick={onPrimaryCTA}
            >
              {primaryCTAText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SheetModal;