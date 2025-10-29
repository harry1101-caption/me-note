import { NoteResponse } from '../../../core/services/api';

/**
 * Sample meeting data for development and testing
 */
export const SAMPLE_MEETINGS: NoteResponse[] = [
  {
    _id: 'sample_001',
    title: 'Product Launch Planning Meeting',
    content: 'Discussed the upcoming product launch strategy for Q2 2024. Reviewed marketing campaigns and timelines.',
    transcription: JSON.stringify([
      { role: 'user', text: 'Good morning everyone. Let\'s start by reviewing our product launch timeline.', timestamp: 0 },
      { role: 'assistant', text: 'The team reviewed the timeline for the Q2 product launch and discussed key milestones.', timestamp: 120 }
    ]),
    meetingTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    duration: 3600, // 1 hour
    recordings: [],
    summary: {
      attendees: ['Marketing Team', 'Product Manager', 'CEO'],
      actionItems: [
        'Chuẩn bị tài liệu marketing và nội dung quảng bá sản phẩm',
        'Lên kế hoạch chi tiết cho sự kiện ra mắt sản phẩm',
        'Phân công trách nhiệm cho từng thành viên trong nhóm'
      ],
      notes: 'Cuộc họp tập trung vào việc xây dựng kế hoạch chi tiết cho việc ra mắt sản phẩm mới vào quý 2 năm 2024. Nhóm đã xem xét và thảo luận về các chiến dịch marketing, phân bổ ngân sách và các mốc thời gian quan trọng của dự án.'
    },
    isDeleted: false,
    createdBy: 'sample-user',
    updatedBy: 'sample-user',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'sample_002',
    title: 'Weekly Team Standup',
    content: 'Team updates on current projects and blockers. Discussed sprint planning and resource allocation.',
    transcription: JSON.stringify([
      { role: 'user', text: 'Let\'s go around and share what everyone is working on.', timestamp: 0 },
      { role: 'assistant', text: 'Team members shared their progress and discussed upcoming tasks.', timestamp: 180 }
    ]),
    meetingTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    duration: 1800, // 30 minutes
    recordings: [],
    summary: {
      attendees: ['Tech Lead', 'Developer 1', 'Developer 2', 'Designer'],
      actionItems: [
        'Cập nhật tài liệu dự án',
        'Giải quyết các blocker được xác định trong cuộc họp',
        'Chuẩn bị cho sprint planning tuần sau'
      ],
      notes: 'Cuộc họp standup hàng tuần giúp nhóm chia sẻ về tiến độ công việc hiện tại, các vấn đề đang gặp phải và kế hoạch cho tuần tiếp theo. Nhóm cũng trao đổi về planning cho sprint sắp tới và phân bổ tài nguyên cho các dự án.'
    },
    isDeleted: false,
    createdBy: 'sample-user',
    updatedBy: 'sample-user',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'sample_003',
    title: 'Quarterly Business Review',
    content: 'Reviewed Q1 performance metrics and set goals for Q2. Discussed budget allocations and team expansion plans.',
    transcription: JSON.stringify([
      { role: 'user', text: 'Looking at our Q1 results, we exceeded targets by 15%.', timestamp: 0 },
      { role: 'assistant', text: 'The team discussed Q1 achievements and planned Q2 objectives.', timestamp: 240 }
    ]),
    meetingTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    duration: 5400, // 1.5 hours
    recordings: [],
    summary: {
      attendees: ['CEO', 'Finance Director', 'HR Manager', 'Department Heads'],
      actionItems: [
        'Thuê 2 kỹ sư mới để mở rộng nhóm phát triển',
        'Phân bổ ngân sách cho các dự án Q2',
        'Thiết lập KPI cho quý 2'
      ],
      notes: 'Cuộc họp đánh giá kinh doanh hàng quý tập trung vào việc xem xét kết quả quý 1, trong đó công ty đã vượt mục tiêu 15%. Nhóm đã thảo luận về việc phân bổ ngân sách cho quý 2 và các kế hoạch mở rộng nhóm phát triển.'
    },
    isDeleted: false,
    createdBy: 'sample-user',
    updatedBy: 'sample-user',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'sample_004',
    title: 'Client Feedback Session',
    content: 'Gathered feedback from major clients on our platform. Discussed feature requests and pain points.',
    transcription: JSON.stringify([
      { role: 'user', text: 'Thank you for joining us today. We\'d love to hear your thoughts on the new features.', timestamp: 0 },
      { role: 'assistant', text: 'Clients provided valuable feedback on platform improvements.', timestamp: 300 }
    ]),
    meetingTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    duration: 2700, // 45 minutes
    recordings: [],
    summary: {
      attendees: ['Product Manager', 'Client A', 'Client B', 'Client C'],
      actionItems: [
        'Ưu tiên cải thiện ứng dụng di động',
        'Triển khai tính năng dark mode',
        'Nghiên cứu và phát triển các tính năng được yêu cầu nhiều'
      ],
      notes: 'Buổi họp phản hồi khách hàng tập trung vào việc thu thập ý kiến từ các khách hàng lớn về trải nghiệm sử dụng nền tảng. Khách hàng đã đưa ra nhiều phản hồi tích cực cũng như các đề xuất cải thiện quan trọng cho sản phẩm.'
    },
    isDeleted: false,
    createdBy: 'sample-user',
    updatedBy: 'sample-user',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'sample_005',
    title: 'Technical Architecture Review',
    content: 'Reviewed system architecture and discussed scalability improvements. Planned infrastructure upgrades.',
    transcription: JSON.stringify([
      { role: 'user', text: 'Let\'s start by examining our current system architecture.', timestamp: 0 },
      { role: 'assistant', text: 'The team discussed technical improvements and scalability options.', timestamp: 180 }
    ]),
    meetingTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    duration: 3600, // 1 hour
    recordings: [],
    summary: {
      attendees: ['CTO', 'DevOps Team', 'Backend Engineers', 'System Architect'],
      actionItems: [
        'Tạo kế hoạch migration chi tiết',
        'Đánh giá và lựa chọn nhà cung cấp cloud',
        'Thiết lập môi trường staging cho quá trình migration'
      ],
      notes: 'Cuộc họp rà soát kiến trúc kỹ thuật tập trung vào việc đánh giá kiến trúc hệ thống hiện tại và xác định các điểm cần cải thiện để đảm bảo khả năng mở rộng trong tương lai. Nhóm đã thảo luận về các lựa chọn nâng cấp hạ tầng và đưa ra quyết định về việc di chuyển lên cloud.'
    },
    isDeleted: false,
    createdBy: 'sample-user',
    updatedBy: 'sample-user',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Flag to use sample data instead of API
 * Set to false to use real API data
 */
export const USE_SAMPLE_DATA = false;
