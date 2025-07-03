export declare enum BracketType {
    SINGLE_ELIMINATION = "single",
    DOUBLE_ELIMINATION = "double",
    ROUND_ROBIN = "round-robin"
}
export declare class CreateTournamentBracketDto {
    name: string;
    type: BracketType;
    teamCount: number;
}
