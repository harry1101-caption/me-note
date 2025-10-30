import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonText,
  IonBackButton,
  IonButtons,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  RotateCw,
  Trash2,
  SquarePen,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom';
import { useNotes, Note } from '../../core';
import { formatDuration } from '../HomePage/utils';
import { Tabs } from '../../components';
import { MeetingSummary, MeetingTranscription } from './components';
import './MeetingDetailPage.css';

const MeetingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [present] = useIonToast();
  const { t } = useTranslation();
  const { fetchNoteById, deleteNote } = useNotes();
  const [selectedTab, setSelectedTab] = useState<'summary' | 'transcription'>('summary');
  const [meeting, setMeeting] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Edit title state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);

  // Fetch meeting data by ID
  useEffect(() => {
    const loadMeeting = async () => {
      setLoading(true);
      setError(null);
      try {
        const noteData = await fetchNoteById(id);
        console.log('noteData', noteData?.title);
        console.log('recordings', noteData?.recordings);
        console.log('recordingMetadata', noteData?.recordingMetadata);
        setMeeting(noteData);
      } catch (err) {
        console.error('Error loading meeting:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meeting');
        setMeeting(null);
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id, fetchNoteById]);

  // Setup audio event listeners (re-attach when audioBlob changes)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setElapsedTime(Math.floor(audio.currentTime));
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      // Audio metadata loaded - duration is available in audio.duration
      console.log('Audio duration loaded:', audio.duration);
    };

    const handleEnded = () => {
      console.log('Audio playback ended');
      setIsPlaying(false);
      setElapsedTime(0);
      setProgress(0);
      // Reset audio to beginning
      if (audio) {
        audio.currentTime = 0;
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      present({
        message: t('meetingDetail.audioError'),
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [present, audioBlob]); // Re-attach listeners when audioBlob changes

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (audioBlob) {
        URL.revokeObjectURL(audioBlob);
      }
    };
  }, [audioBlob]);


  const handlePlay = async () => {
    if (!audioRef.current) return;
    
    // If audio is already loaded, just play it
    if (audioBlob || audioRef.current.src) {
      // If audio ended, restart from beginning
      if (audioRef.current.ended || audioRef.current.currentTime === 0) {
        audioRef.current.currentTime = 0;
        setElapsedTime(0);
        setProgress(0);
      }
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        console.log('Play recording:', id);
      }).catch(err => {
        console.error('Error playing audio:', err);
        present({
          message: t('meetingDetail.audioPlayError'),
          duration: 2000,
          position: 'bottom',
          color: 'danger',
        });
      });
      return;
    }

    // Fetch audio from API
    const fileUuid = meeting?.recordingMetadata?.fileUuid;
    if (!fileUuid) {
      present({
        message: t('meetingDetail.audioNotFound'),
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      return;
    }

    setIsLoadingAudio(true);
    try {
      const audioUrl = `https://meonote-api.clen.dev/webhook/file/download?fileUuid=${fileUuid}`;
      console.log('Fetching audio from:', audioUrl);
      
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Set the audio source
      audioRef.current.src = objectUrl;
      
      // Store the blob URL after setting src
      setAudioBlob(objectUrl);
      
      // Wait for metadata to load before playing
      await new Promise<void>((resolve) => {
        const onLoadedMetadata = () => {
          audioRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
          resolve();
        };
        audioRef.current?.addEventListener('loadedmetadata', onLoadedMetadata);
      });
      
      // Now play the audio
      await audioRef.current.play();
      setIsPlaying(true);
      console.log('Play recording:', id);
    } catch (err) {
      console.error('Error fetching/playing audio:', err);
      present({
        message: t('meetingDetail.audioLoadError'),
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('Pause recording:', id);
    }
  };

  const handleDelete = async () => {
    if (!meeting) return;
    
    setIsDeleting(true);
    try {
      await deleteNote(
        id,
        meeting.title || '',
        meeting.summarizedContent || meeting.content || ''
      );
      console.log('Meeting deleted successfully:', id);
      // Navigate back immediately after successful deletion
      history.push('/home');
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      // Still navigate back even if there's an error
      history.push('/home');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setEditingTitle(meeting?.title || '');
    setIsEditing(true);
  };

  const handleSaveTitle = async () => {
    if (!editingTitle.trim() || !id || !meeting) return;
    
    // If title hasn't changed, just cancel
    if (meeting.title === editingTitle.trim()) {
      handleCancelEdit();
      return;
    }
    
    setIsUpdatingTitle(true);
    try {
      // Make direct API call instead of using useNotes updateNoteTitle
      const token = localStorage.getItem('anonymous-token') || '';
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${API_BASE_URL}/webhook/note?id=${id}`, {
        method: 'PUT',
        headers: {
          'anonymous-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingTitle.trim()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update note title');
      }
      
      // Update local meeting state with new title
      setMeeting(prev => prev ? { ...prev, title: editingTitle.trim() } : null);
      
      setIsEditing(false);
      present({
        message: t('meetingDetail.titleUpdateSuccess'),
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating title:', error);
      present({
        message: t('meetingDetail.titleUpdateError'),
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      // Return to non-editing state on error
      handleCancelEdit();
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTitle('');
  };


  const handleRewind = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      audioRef.current.currentTime = newTime;
      console.log('Rewind 15s');
    }
  };

  const handleFastForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
      audioRef.current.currentTime = newTime;
      console.log('Fast forward 15s');
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioRef.current.duration;
    
    audioRef.current.currentTime = newTime;
    console.log('Seek to:', newTime);
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>{t('meetingDetail.title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="meeting-detail-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !meeting) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>{t('meetingDetail.title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="meeting-detail-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <IonText color="medium">
              <h2>{t('meetingDetail.notFound')}</h2>
              <p>{error || t('meetingDetail.notFoundMessage')}</p>
            </IonText>
            <IonButton fill="outline" onClick={() => history.push('/home')}>
              {t('meetingDetail.backToHome')}
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Parse summary from jsonData if available
  const parsedSummary = meeting.jsonData as {
    purpose?: string;
    key_points?: string[];
    detailed_summary?: string;
    next_actions?: (string | { task: string; owner?: string; due_date?: string })[];
  } | undefined;

  // Check if audio is available
  const hasAudio = !!meeting.recordingMetadata?.fileUuid;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTitle();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              autoFocus
              disabled={isUpdatingTitle}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                paddingTop: '0px',
                paddingBottom: '0px',
                paddingInline: '20px',
                margin: 0,
                fontSize: '20px',
                fontWeight: '500',
                textAlign: 'start',
                lineHeight: '0.0125em',
              }}
              placeholder={t('meetingDetail.titlePlaceholder')}
            />
          ) : (
            <IonTitle>{meeting.title || t('meetingDetail.title')}</IonTitle>
          )}
          <IonButtons slot="end">
            <IonButton fill="clear" color="primary" onClick={handleEdit} disabled={isEditing || isUpdatingTitle}>
              <SquarePen size={20} />
            </IonButton>
            <IonButton fill="clear" color="primary" onClick={handleDelete} disabled={isDeleting || isEditing}>
              {isDeleting ? <IonSpinner name="crescent" /> : <Trash2 size={20} />}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="meeting-detail-content">
        <div className="meeting-detail-container">
          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            preload="none"
            style={{ display: 'none' }}
          />

          {/* Media Player */}
          <div className="media-player">
            <div className="media-player-content">
                {/* Progress Bar Section */}
                <div className="progress-section">
                  <div 
                    className="progress-bar-container"
                    onClick={handleProgressClick}
                  >
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                      <div 
                        className="progress-scrubber"
                        style={{ left: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="time-labels">
                    <div className="time-label elapsed">
                      {formatDuration(elapsedTime)}
                    </div>
                    <div className="time-label duration">
                      {formatDuration( meeting?.recordingMetadata?.duration_seconds || 0)}
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="control-buttons">
          
                  
                  <div>
                  <button 
                    className="control-btn rewind" 
                    onClick={handleRewind}
                    disabled={!hasAudio || isLoadingAudio}
                  >
                    <RotateCcw size={16} />
                  </button>
                  
                  <button 
                    className={`control-btn play-pause ${isPlaying ? 'playing' : ''}`}
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={!hasAudio || isLoadingAudio}
                  >
                    {isLoadingAudio ? (
                      <IonSpinner name="crescent" style={{ width: '20px', height: '20px' }} />
                    ) : isPlaying ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </button>
                  
                  <button 
                    className="control-btn fast-forward" 
                    onClick={handleFastForward}
                    disabled={!hasAudio || isLoadingAudio}
                  >
                    <RotateCw size={16} />
                  </button>
                  </div>
                  
                  
                </div>
              </div>
          </div>

          {/* Tabs */}
          <div className="meeting-tabs-container">
            <Tabs
              tabs={[
                { id: 'summary', label: t('meetingDetail.summary') },
                { id: 'transcription', label: t('meetingDetail.transcription') }
              ]}
              value={selectedTab}
              onChange={(tabId) => setSelectedTab(tabId as 'summary' | 'transcription')}
              variant="pill"
              fullWidth
            />
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {selectedTab === 'summary' && (
              <MeetingSummary 
                summarizedContent={meeting.summarizedContent}
                summary={parsedSummary} 
              />
            )}

            {selectedTab === 'transcription' && (
              <MeetingTranscription transcription={meeting.transcription} />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MeetingDetailPage;
