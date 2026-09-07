export interface CommitteeSection {
  name: string;
  coordinator: string;
  members: string[];
}

export interface AdhocCommittee {
  id: string;
  name: string;
  code: string;
  skNumber: string;
  skDate: string;
  eventDate: string;
  targetBudget: number;
  description: string;
  structure: {
    ketua: { name: string; phone: string; address?: string };
    sekretaris: { name: string; phone: string };
    bendahara: { name: string; phone: string };
    sections: CommitteeSection[];
  };
  status: 'AKTIF' | 'SELESAI' | 'DIBUBARKAN';
  createdAt: string;
}
