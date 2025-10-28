import React from 'react';
import { IonButton } from '@ionic/react';
import { MoreHorizontal, Share, Edit, Trash2 } from 'lucide-react';
import { Menu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';

interface MeetingActionsMenuProps {
  meetingId: string;
  onShare: (meetingId: string) => void;
  onRename: (meetingId: string) => void;
  onDelete: (meetingId: string) => void;
}

const MeetingActionsMenu: React.FC<MeetingActionsMenuProps> = ({
  meetingId,
  onShare,
  onRename,
  onDelete,
}) => {
  return (
    <Menu
      menuButton={
        <IonButton 
          fill="clear" 
          className="more-button"
        >
          <MoreHorizontal size={20} />
        </IonButton>
      }
      position="anchor"
      align="end"
      direction="bottom"
      viewScroll="close"
      portal={true}
    >
      <MenuItem onClick={() => onShare(meetingId)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Share size={18} />
          <span>Share</span>
        </div>
      </MenuItem>
      <MenuItem onClick={() => onRename(meetingId)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Edit size={18} />
          <span>Rename</span>
        </div>
      </MenuItem>
      <MenuItem onClick={() => onDelete(meetingId)} data-danger="true">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trash2 size={18} />
          <span>Delete</span>
        </div>
      </MenuItem>
    </Menu>
  );
};

export default MeetingActionsMenu;
