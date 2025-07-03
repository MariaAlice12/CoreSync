import { User } from 'src/user/entities/user.entity';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';
export declare class Event {
    id: number;
    user: User;
    title: string;
    description: string;
    image: string;
    date: Date;
    tournamentBracket: TournamentBracket;
    createdAt: Date;
    updatedAt: Date;
}
