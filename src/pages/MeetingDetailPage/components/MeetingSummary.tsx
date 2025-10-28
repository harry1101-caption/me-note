import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonText,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import ReactMarkdown from 'react-markdown';

interface MeetingSummaryProps {
  summarizedContent?: string;
  summary?: {
    purpose?: string;
    key_points?: string[];
    detailed_summary?: string;
    next_actions?: (string | { task: string; owner?: string; due_date?: string })[];
  };
}

const MeetingSummary: React.FC<MeetingSummaryProps> = ({ summarizedContent, summary }) => {
  if (!summarizedContent && !summary) return null;

  return (
    <div className="summary-content">
      {/* Summarized Content with Markdown */}
      {/* {summarizedContent && (
        <IonCard>
          <IonCardContent>
            <div className="content-section markdown-content">
              <ReactMarkdown>{summarizedContent}</ReactMarkdown>
            </div>
          </IonCardContent>
        </IonCard>
      )} */}

      {/* Purpose */}
      {summary?.purpose && (
        <IonCard>
          <IonCardContent>
            <div className="content-section">
              <IonText>
                <h3>Mục đích</h3>
              </IonText>
              <IonText color="medium">
                <p>{summary.purpose}</p>
              </IonText>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      {/* Key Points */}
      {summary?.key_points && summary.key_points.length > 0 && (
        <IonCard>
          <IonCardContent>
            <div className="content-section">
              <IonText>
                <h3>Điểm chính</h3>
              </IonText>
              <IonList>
                {summary.key_points.map((point: string, index: number) => (
                  <IonItem key={index}>
                    <div 
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--ion-color-primary)',
                        marginRight: '12px',
                        flexShrink: 0
                      }}
                    />
                    <IonLabel>
                      <p>{point}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      {/* Detailed Summary */}
      {summary?.detailed_summary && (
        <IonCard>
          <IonCardContent>
            <div className="content-section">
              <IonText>
                <h3>Tóm tắt chi tiết</h3>
              </IonText>
              <IonText color="medium">
                <p>{summary.detailed_summary}</p>
              </IonText>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      {/* Next Actions */}
      {summary?.next_actions && summary.next_actions.length > 0 && (
        <IonCard>
          <IonCardContent>
            <div className="content-section">
              <IonText>
                <h3>Hành động tiếp theo</h3>
              </IonText>
              <IonList>
                {summary.next_actions.map((action: string | { task: string; owner?: string; due_date?: string }, index: number) => {
                  // Handle both string and object action items
                  const actionText = typeof action === 'string' 
                    ? action 
                    : action.task || JSON.stringify(action);
                  
                  const owner = typeof action === 'object' && action.owner ? action.owner : null;
                  const dueDate = typeof action === 'object' && action.due_date ? action.due_date : null;
                  
                  return (
                    <IonItem key={index}>
                      <div 
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--ion-color-gray-400)',
                          marginRight: '12px',
                          flexShrink: 0
                        }}
                      />
                      <IonLabel>
                        <p>{actionText}</p>
                        {(owner || dueDate) && (
                          <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginTop: '4px' }}>
                            {owner && <span>Owner: {owner}</span>}
                            {owner && dueDate && <span> • </span>}
                            {dueDate && <span>Due: {dueDate}</span>}
                          </div>
                        )}
                      </IonLabel>
                    </IonItem>
                  );
                })}
              </IonList>
            </div>
          </IonCardContent>
        </IonCard>
      )}
    </div>
  );
};

export default MeetingSummary;
