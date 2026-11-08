// Níveis de prática do atleta no esporte.
export const NIVEIS_TREINO = [
  'iniciante',
  'intermediario',
  'avancado',
] as const;
export type NivelTreino = (typeof NIVEIS_TREINO)[number];
