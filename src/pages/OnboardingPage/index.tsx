import React from 'react';
import {
  IonButton,
  IonContent,
  IonPage,
  IonText,
} from '@ionic/react';
import Lottie from 'lottie-react';
import { useHistory } from 'react-router-dom';
import onboardingAnimation from '../../../public/images/onboarding.json';
import './OnboardingPage.css';

const OnboardingPage: React.FC = () => {
  const history = useHistory();

  const handleGetStarted = () => {
    // Store onboarding completion in localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    // Navigate to home page
    history.push('/home');
  };

  return (
    <IonPage>
      <IonContent className="onboarding-content">
        <div className="onboarding-container">
          <div className="onboarding-content-wrapper">
            {/* Lottie Animation */}
            <div className="animation-container">
              <Lottie
                animationData={onboardingAnimation}
                loop={true}
                autoplay={true}
                style={{ width: 256, height: 256 }}
              />
            </div>

            {/* Title */}
            <IonText className="onboarding-title">
              Welcome to MeoNote
            </IonText>

            {/* Subtitle */}
            <IonText className="onboarding-subtitle">
              Capture ideas with your voice. Let AI turn them into smart notes.
            </IonText>
          </div>

          {/* CTA Button */}
          <div className="onboarding-button-container">
            <IonButton size="large" onClick={handleGetStarted} color="primary" expand="block">Get Started</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;
