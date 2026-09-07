export type MeetingType =
  | 'PLENO'
  | 'RAKER'
  | 'KOORDINASI_SEKSI'
  | 'EVALUASI'
  | 'DARURAT';

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'ALPA' | 'UNDANGAN';

export interface MeetingInvitee {
  id: string;
  userId?: string;
  name: string;
  role: string;
  phone?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface MeetingActionItem {
  id: string;
  task: string;
  pic: string;
  deadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface IntegratedMeeting {
  id: string;
  title: string;
  meetingType: MeetingType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  location: string;
  agenda: string[];
  invitees: MeetingInvitee[];
  externalInvitees?: string[];
  minutes: {
    summary: string;
    decisions: string[];
    actionItems: MeetingActionItem[];
    recordedBy: string;
    finalizedAt?: string;
  };
  status: 'TERJADWAL' | 'SEDANG_BERLANGSUNG' | 'SELESAI' | 'ARSIP';
  createdAt: string;
}
