import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonText,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { play, pause, stop, trash, share } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import './RecordingDetailPage.css';

const RecordingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const handlePlay = () => {
    // TODO: Implement audio playback
    console.log('Play recording:', id);
  };

  const handlePause = () => {
    // TODO: Implement audio pause
    console.log('Pause recording:', id);
  };

  const handleStop = () => {
    // TODO: Implement audio stop
    console.log('Stop recording:', id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete recording:', id);
    history.push('/home');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share recording:', id);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Recording Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="recording-detail-content">
        <div className="recording-detail-container">
          {/* Recording Info */}
          <div className="recording-info">
            <IonText>
              <h2>Recording #{id}</h2>
              <p>Created: {new Date().toLocaleDateString()}</p>
              <p>Duration: 2:34</p>
              <p>File Size: 1.2 MB</p>
            </IonText>
          </div>

          {/* Audio Controls */}
          <div className="audio-controls">
            <IonButton
              fill="outline"
              className="control-button"
              onClick={handlePlay}
            >
              <IonIcon icon={play} />
            </IonButton>
            <IonButton
              fill="outline"
              className="control-button"
              onClick={handlePause}
            >
              <IonIcon icon={pause} />
            </IonButton>
            <IonButton
              fill="outline"
              className="control-button"
              onClick={handleStop}
            >
              <IonIcon icon={stop} />
            </IonButton>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <IonButton
              expand="block"
              fill="outline"
              color="primary"
              onClick={handleShare}
            >
              <IonIcon icon={share} slot="start" />
              Share
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              onClick={handleDelete}
            >
              <IonIcon icon={trash} slot="start" />
              Delete
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RecordingDetailPage;
