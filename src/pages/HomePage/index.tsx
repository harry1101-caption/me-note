import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonText,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  useIonToast,
} from '@ionic/react';
import { 
  Settings, 
  
  Calendar, 
  Clock, 
  Mic,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloatingActionButton, SheetModal, Input } from '../../components';
import { MeetingActionsMenu, SettingsContent } from './components';
import { useNotes, uploadRecording, type Note } from '../../core';
import { convertNoteToMeetingDisplay, truncateText, createPendingMeeting, type MeetingDisplayData } from './utils';
import { useHistory } from 'react-router-dom';
import './HomePage.css';
import RecordingInterface from './components/recording-interface';

const HomePage: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRecordingSheetOpen, setIsRecordingSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingMeetings, setPendingMeetings] = useState<MeetingDisplayData[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const isInitialMount = useRef(true);

  // Use the notes API hook
  const {
    data: notes,
    loading,
    error,
    fetchNotes,
    searchNotes,
    deleteNote,
    addNote,
    updateNoteTitle,
  } = useNotes();

  const handleNewRecording = () => {
    console.log('Start new recording');
    setIsRecordingSheetOpen(true);
  };

  const handleStopRecording = () => {
    console.log('Stop recording');
    setIsRecordingSheetOpen(false);
    // TODO: Handle stop recording logic
  };

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    console.log('Recording completed. Blob size:', blob.size, 'bytes');
    console.log('Recording type:', blob.type);
    
    // Create a temporary ID for the pending meeting
    const tempId = `pending_${Date.now()}`;
    
    // Create and add pending meeting immediately
    const pendingMeeting = createPendingMeeting(tempId);
    setPendingMeetings(prev => [pendingMeeting, ...prev]);
    
    setIsUploading(true);
    
    try {
      const result = await uploadRecording(blob);
      
      if (result.success) {
        console.log('Upload successful:', result.data);
        
        // Add the new note to the notes list
        if (result.data && typeof result.data === 'object' && '_id' in result.data) {
          const newNote = result.data as Note;
          
          // Add the note to the actual notes list
          addNote(newNote);
          
          // Remove the pending meeting
          setPendingMeetings(prev => prev.filter(m => m.id !== tempId));
          
          // Show success message
          present({
            message: t('home.uploadSuccess'),
            duration: 1000,
            position: 'bottom',
            color: 'success',
          });
        } else {
          // If no data returned, just remove the pending meeting
          setPendingMeetings(prev => prev.filter(m => m.id !== tempId));
         
        }
      } else {
        console.error('Upload failed:', result.message);
        // Remove the pending meeting on failure
        setPendingMeetings(prev => prev.filter(m => m.id !== tempId));
        present({
          message: `${t('home.uploadError')}: ${result.message}`,
          duration: 1000,
          position: 'bottom',
          color: 'danger',
        });
      }
    } catch (error) {
      console.error('Error during upload:', error);
      // Remove the pending meeting on error
      setPendingMeetings(prev => prev.filter(m => m.id !== tempId));
      present({
        message: t('home.uploadErrorGeneral'),
        duration: 1000,
        position: 'bottom',
        color: 'danger',
      });
    } finally {
      setIsUploading(false);
    }
  }, [present, addNote, t]);

  const handleSettingsClick = () => {
    console.log('Settings button clicked!');
    setIsSheetOpen(true);
  };

  // Menu action handlers

  const handleShare = async (meetingId: string) => {
    console.log('Share meeting:', meetingId);
    
    // Find the meeting to get its title
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    // Create the shareable URL
    const shareUrl = `${window.location.origin}/meeting/${meetingId}`;
    const shareData = {
      title: meeting.title || 'Meeting Note',
      text: `Check out this meeting note: ${meeting.title}`,
      url: shareUrl,
    };

    try {
      // Check if the Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        present({
          message: 'Link copied to clipboard!',
          duration: 2000,
          position: 'bottom',
          color: 'success',
        });
      }
    } catch (error) {
      // Handle user cancellation or errors
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        present({
          message: 'Failed to share',
          duration: 2000,
          position: 'bottom',
          color: 'danger',
        });
      }
    }
  };

  const handleRename = (meetingId: string) => {
    // Find the meeting to get its current title
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    setEditingMeetingId(meetingId);
    setEditingTitle(meeting.title);
  };

  const handleTitleClick = (meetingId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to detail page
    setEditingMeetingId(meetingId);
    setEditingTitle(currentTitle);
  };

  const handleTitleSave = async () => {
    if (!editingMeetingId || !editingTitle.trim()) {
      handleTitleCancel();
      return;
    }
    
    // If title hasn't changed, just cancel
    const meeting = meetings.find(m => m.id === editingMeetingId);
    if (meeting && meeting.title === editingTitle.trim()) {
      handleTitleCancel();
      return;
    }
    
    setIsUpdatingTitle(true);
    
    try {
      await updateNoteTitle(editingMeetingId, editingTitle.trim());
      
      present({
        message: t('home.renameSuccess'),
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });
      
      handleTitleCancel();
    } catch (error) {
      console.error('Error updating title:', error);
      present({
        message: t('home.renameError'),
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      handleTitleCancel();
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setEditingMeetingId(null);
    setEditingTitle('');
  };

  const handleDelete = async (meetingId: string) => {
    console.log('Delete meeting:', meetingId);
    
    // Find the meeting to get its data
    const meetingToDelete = meetings.find(m => m.id === meetingId);
    if (!meetingToDelete) return;
    
    // Add to deleting set to trigger animation
    setDeletingIds(prev => new Set(prev).add(meetingId));
    
    // Wait for animation to complete before actually deleting
    setTimeout(async () => {
      try {
        await deleteNote(
          meetingId,
          meetingToDelete.note.title || '',
          meetingToDelete.note.summarizedContent || meetingToDelete.note.content || ''
        );
        console.log('Meeting deleted successfully:', meetingId);
      } catch (error) {
        console.error('Failed to delete meeting:', error);
        // Remove from deleting set if failed
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(meetingId);
          return newSet;
        });
      }
    }, 500); // Match animate.css fadeOut with animate__faster duration
  };

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        searchNotes(searchQuery, { limit: 50 });
        setIsSearching(false);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else if (!isInitialMount.current) {
      // If search is cleared after initial mount, fetch all notes
      setIsSearching(false);
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery
  
  // Track after initial mount
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async (event: CustomEvent) => {
    try {
      // Clear pending meetings when refreshing
      setPendingMeetings([]);
      
      if (searchQuery.trim()) {
        await searchNotes(searchQuery, { limit: 50 });
      } else {
        await fetchNotes();
      }
    } finally {
      event.detail.complete();
    }
  }, [searchQuery, searchNotes, fetchNotes]);

  // Use API data - ensure it's always an array (memoized)
  const displayNotes = useMemo(() => {
    return Array.isArray(notes) ? notes : [];
  }, [notes]);
  
  const isLoading = loading;
  
  // Convert API notes to meeting format for display (memoized)
  const meetings = useMemo(() => {
    const apiMeetings = displayNotes.map(convertNoteToMeetingDisplay);
    // Combine pending meetings with API meetings (pending at the top)
    return [...pendingMeetings, ...apiMeetings];
  }, [displayNotes, pendingMeetings]);

  // Group meetings by time period (memoized)
  const groupedMeetings = useMemo(() => {
    const groupMeetingsByTime = (meetingsList: MeetingDisplayData[]) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const groups: Record<string, MeetingDisplayData[]> = {
        [t('home.timeGroups.today')]: [],
        [t('home.timeGroups.yesterday')]: [],
        [t('home.timeGroups.lastWeek')]: [],
        [t('home.timeGroups.lastMonth')]: [],
        [t('home.timeGroups.older')]: [],
      };

      meetingsList.forEach((meeting: MeetingDisplayData) => {
        const meetingDate = new Date(meeting.note.createdAt);
        
        if (meetingDate >= today) {
          groups[t('home.timeGroups.today')].push(meeting);
        } else if (meetingDate >= yesterday) {
          groups[t('home.timeGroups.yesterday')].push(meeting);
        } else if (meetingDate >= weekAgo) {
          groups[t('home.timeGroups.lastWeek')].push(meeting);
        } else if (meetingDate >= monthAgo) {
          groups[t('home.timeGroups.lastMonth')].push(meeting);
        } else {
          groups[t('home.timeGroups.older')].push(meeting);
        }
      });

      // Filter out empty groups
      return Object.entries(groups).filter(([, groupMeetings]) => groupMeetings.length > 0);
    };

    return groupMeetingsByTime(meetings);
  }, [meetings, t]);

  return (
    <IonPage>
      {/* Header */}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton 
              fill="clear" 
              onClick={handleSettingsClick}
              style={{ 
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: 10
              }}
            >
              <Settings size={20} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="home-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <div className="home-container">
          {/* Page Title */}
          <div className="page-title-section">
            <IonText>
              <h1 className="page-title">{t('home.title')}</h1>
            </IonText>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <Input 
              placeholder={t('home.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<Search size={20} />}
              variant="default"
              fullWidth
            />
            {isSearching && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <IonSpinner name="crescent" />
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="error-section" style={{ 
              padding: '20px', 
              textAlign: 'center',
              color: 'var(--ion-color-danger)'
            }}>
              <IonText color="danger">
                <p>{t('home.loadingError')}: {error}</p>
                <IonButton 
                  fill="outline" 
                  size="small" 
                  onClick={() => fetchNotes()}
                >
                  {t('common.retry')}
                </IonButton>
              </IonText>
            </div>
          )}

          {/* Content Section */}
          {!error && (
            <div className="content-section">
              {isLoading ? (
                <div className="loading-section" style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '40px'
                }}>
                  <IonSpinner name="crescent" />
                  <IonText color="medium" style={{ marginLeft: '10px' }}>
                    {t('common.loading')}
                  </IonText>
                </div>
              ) : meetings.length > 0 ? (
                <>
                  {/* Show search results header if searching */}
                  {searchQuery && (
                    <div className="section-title" style={{ marginBottom: '12px' }}>
                      <IonText color="medium">
                        {t('home.searchResults')} ({meetings.length})
                      </IonText>
                    </div>
                  )}
                  
                  {/* Grouped meetings by time period */}
                  {searchQuery ? (
                    // When searching, don't group - show all results
                    <div className="meetings-list">
                      {meetings.map((meeting) => (
                        <div 
                          key={meeting.id} 
                          className={`meeting-card ${
                            deletingIds.has(meeting.id)
                              ? 'animate__animated animate__fadeOut animate__faster'
                              : meeting.isPending 
                                ? 'meeting-card-pending animate__animated animate__pulse animate__infinite' 
                                : 'animate__animated animate__fadeInUp'
                          }`}
                          onClick={() => {
                            // Don't navigate if it's a pending or deleting meeting
                            if (meeting.isPending || deletingIds.has(meeting.id)) return;
                            // Navigate to meeting detail page
                            console.log('Navigate to meeting:', meeting.id);
                            history.push(`/meeting/${meeting.id}`);
                          }}
                          style={{ 
                            cursor: (meeting.isPending || deletingIds.has(meeting.id)) ? 'default' : 'pointer',
                            pointerEvents: deletingIds.has(meeting.id) ? 'none' : 'auto'
                          }}
                        >
                          <div className="meeting-content">
                            <div className="meeting-title">
                              {editingMeetingId === meeting.id ? (
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onBlur={handleTitleSave}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleTitleSave();
                                    } else if (e.key === 'Escape') {
                                      handleTitleCancel();
                                    }
                                  }}
                                  autoFocus
                                  disabled={isUpdatingTitle}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '0',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    width: '100%',
                                    outline: 'none',
                                    color: '#000',
                                    fontFamily: 'inherit',
                                  }}
                                />
                              ) : (
                                <IonText 
                                  onClick={(e) => handleTitleClick(meeting.id, meeting.title, e)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {truncateText(meeting.title, 50)}
                                </IonText>
                              )}
                            </div>
                            <div className="meeting-details">
                              <Calendar size={14} className="detail-icon" />
                              <IonText color="medium" className="detail-text">
                                {meeting.date}
                              </IonText>
                              {meeting.time && (
                                <>
                                  <Clock size={14} className="detail-icon" />
                                  <IonText color="medium" className="detail-text">
                                    {meeting.time}
                                  </IonText>
                                </>
                              )}
                            </div>
                          </div>
                          {meeting.isLoading ? (
                            <IonSpinner name="crescent" />
                          ) : (
                            <div onClick={(e) => e.stopPropagation()}>
                              <MeetingActionsMenu
                                meetingId={meeting.id}
                                onShare={handleShare}
                                onRename={handleRename}
                                onDelete={handleDelete}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // When not searching, group by time
                    groupedMeetings.map(([groupName, groupMeetings]) => (
                      <div key={groupName} style={{ marginBottom: '24px' }}>
                        <div className="section-title" style={{ marginBottom: '12px' }}>
                          <IonText color="medium">
                            {groupName}
                          </IonText>
                        </div>
                        <div className="meetings-list">
                          {groupMeetings.map((meeting) => (
                            <div 
                              key={meeting.id} 
                              className={`meeting-card ${
                                deletingIds.has(meeting.id)
                                  ? 'animate__animated animate__fadeOut animate__faster'
                                  : meeting.isPending 
                                    ? 'meeting-card-pending animate__animated animate__pulse animate__infinite' 
                                    : 'animate__animated animate__fadeIn'
                              }`}
                              onClick={() => {
                                // Don't navigate if it's a pending or deleting meeting
                                if (meeting.isPending || deletingIds.has(meeting.id)) return;
                                // Navigate to meeting detail page
                                console.log('Navigate to meeting:', meeting.id);
                                history.push(`/meeting/${meeting.id}`);
                              }}
                              style={{ 
                                cursor: (meeting.isPending || deletingIds.has(meeting.id)) ? 'default' : 'pointer',
                                pointerEvents: deletingIds.has(meeting.id) ? 'none' : 'auto'
                              }}
                            >
                              <div className="meeting-content">
                                <div className="meeting-title">
                                  {editingMeetingId === meeting.id ? (
                                    <input
                                      type="text"
                                      value={editingTitle}
                                      onChange={(e) => setEditingTitle(e.target.value)}
                                      onBlur={handleTitleSave}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleTitleSave();
                                        } else if (e.key === 'Escape') {
                                          handleTitleCancel();
                                        }
                                      }}
                                      autoFocus
                                      disabled={isUpdatingTitle}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        width: '100%',
                                        outline: 'none',
                                        color: '#000',
                                        fontFamily: 'inherit',
                                      }}
                                    />
                                  ) : (
                                    <IonText 
                                      onClick={(e) => handleTitleClick(meeting.id, meeting.title, e)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {truncateText(meeting.title, 50)}
                                    </IonText>
                                  )}
                                </div>
                                <div className="meeting-details">
                                  <Calendar size={14} className="detail-icon" />
                                  <IonText color="medium" className="detail-text">
                                    {meeting.date}
                                  </IonText>
                                  {meeting.time && (
                                    <>
                                      <Clock size={14} className="detail-icon" />
                                      <IonText color="medium" className="detail-text">
                                        {meeting.time}
                                      </IonText>
                                    </>
                                  )}
                                </div>
                              </div>
                              {meeting.isLoading ? (
                                <IonSpinner name="crescent" />
                              ) : (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <MeetingActionsMenu
                                    meetingId={meeting.id}
                                    onShare={handleShare}
                                    onRename={handleRename}
                                    onDelete={handleDelete}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <div className="no-results" style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: 'var(--ion-color-medium)'
                }}>
                  <IonText color="medium">
                    {searchQuery ? t('home.noResults') : t('home.noMeetings')}
                  </IonText>
                  {!searchQuery && (
                    <div style={{ marginTop: '10px' }}>
                      <IonText color="medium">
                        {t('home.noMeetingsHint')}
                      </IonText>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton 
          icon={<Mic size={20} color="#fff" />}
          onClick={handleNewRecording}
          className={isRecordingSheetOpen ? "recording-active" : ""}
        />

        {/* Recording Sheet Modal */}
        <SheetModal 
          isOpen={isRecordingSheetOpen}
          onClose={() => !isUploading && setIsRecordingSheetOpen(false)}
          showHeader={false}
          content={
            isUploading ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '40px',
                gap: '16px'
              }}>
                <IonSpinner name="crescent" />
                <IonText color="medium">
                  {t('home.uploading')}
                </IonText>
              </div>
            ) : (
              <RecordingInterface 
                isRecording={true}
                
                onStop={handleStopRecording}
                onRecordingComplete={handleRecordingComplete}
              />
            )
          }
          height="40vh"
        />

        {/* Settings Modal */}
        <SheetModal 
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title={t('settings.title')}
          content={
            <SettingsContent 
              userId="user_12345"
            />
          }
        />

      </IonContent>
    </IonPage>
  );
};

export default HomePage;
