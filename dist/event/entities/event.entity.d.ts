import { User } from 'src/user/entities/user.entity';
import { TournamentBracket } from 'src/tournament-bracket/entities/tournament-bracket.entity';
import { EventRegistration } from 'src/event-registration/entities/event-registration.entity';
import { EventPhoto } from './event-photo.entity';
export declare class Event {
    id: number;
    user: User;
    organizers: User[];
    registrations: EventRegistration[];
    photos: EventPhoto[];
    title: string;
    description: string;
    image: string;
    date: Date;
    location: string | null;
    tournamentBracket: TournamentBracket;
    createdAt: Date;
    updatedAt: Date;
}
