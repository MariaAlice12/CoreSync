// Níveis de autoavaliação do atleta no esporte (informados na matrícula).
export const NIVEIS_TREINO = [
  'iniciante',
  'intermediario',
  'avancado',
] as const;
export type NivelTreino = (typeof NIVEIS_TREINO)[number];
