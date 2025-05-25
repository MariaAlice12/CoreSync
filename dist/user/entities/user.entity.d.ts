export declare class User {
    id: number;
    nome: string;
    tipoUsuario: TipoUser;
    email: string;
    senha: string;
}
type TipoUser = 'aluno' | 'professor' | 'admin';
export {};
