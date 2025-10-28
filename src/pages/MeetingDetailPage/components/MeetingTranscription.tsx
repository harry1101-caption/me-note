import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonText,
} from '@ionic/react';

interface MeetingTranscriptionProps {
  transcription: string;
}

const MeetingTranscription: React.FC<MeetingTranscriptionProps> = ({ transcription }) => {
  return (
    <div className="transcription-content">
      <IonCard>
        <IonCardContent>
          <div className="content-section">
            <IonText>
              <h3>Meeting Transcription</h3>
            </IonText>
            {transcription && transcription.trim() ? (
              <div className="transcription-text">
                <IonText>
                  <p>{transcription}</p>
                </IonText>
              </div>
            ) : (
              <div className="no-transcription">
                <IonText color="medium">
                  <p>No transcription available for this meeting.</p>
                </IonText>
              </div>
            )}
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default MeetingTranscription;
