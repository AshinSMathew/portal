export interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  venue: string | null;
  startDatetime: string;
  endDatetime: string;
  status: string | null;
  participationPoints: number | null;
  volunteerPoints: number | null;
  registrationLimit: number | null;
  registrationCount: number;
  attendanceCount: number;
  posterUrl: string | null;
  volunteerEmails?: string[];
  registrationDeadline?: string | null;
  registered?: boolean;
  registeredRole?: string | null;
}

export interface Registration {
  id: string;
  role: string;
  registeredAt: string;
  student: {
    id: string;
    name: string;
    department: string;
    batch: string;
    iecdId: string;
    admissionNumber?: string;
    phone?: string | null;
  };
  attended: boolean;
}
