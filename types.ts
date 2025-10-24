
export interface ChapterFromFile {
  chapitre_nom: string;
  sous_chapitre: string | null;
  type_bloc: string;
  page_ia: number;
  page_debut: number;
  page_fin: number;
}

export interface Chapter extends ChapterFromFile {
  id: string;
}
