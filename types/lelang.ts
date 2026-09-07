export type LelangStatus = 'BERLANGSUNG' | 'SELESAI' | 'DIBATALKAN';

export interface LelangItem {
  id: string;
  itemName: string;
  description: string;
  photoUrls: string[];
  startingBid: number;
  currentHighestBid: number;
  currentBidderName?: string; // opsional, bisa "Hamba Allah" kalau bidder minta anonim
  deadlineDate: string;
  status: LelangStatus;
  winnerName?: string;
  finalPrice?: number;
  coordinatorContact: string; // nomor WA panitia untuk koordinasi tawar
  division: string; // divisi/seksi yang mengadakan lelang
  createdBy: string;
}
