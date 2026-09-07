export type GalleryCategory =
  | 'KAJIAN'
  | 'PHBI'
  | 'RAPAT'
  | 'SOSIAL'
  | 'PEMBANGUNAN'
  | 'TPA'
  | 'LAINNYA';

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  category: GalleryCategory;
  photoUrl: string;
  division: string;
  uploadedBy: string;
  date: string;
}
