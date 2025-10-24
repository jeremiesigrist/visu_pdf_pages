
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

export interface QCM {
    id: string;
    numero: number;
    question: string;
    options: Record<string, string>;
    reponse_correcte: string;
    explication: string;
    sous_chapitre: string;
    sourceChapter: string; // The parent chapter name
}
