import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Event } from 'src/event/entities/event.entity';
import { EventRegistration } from 'src/event-registration/entities/event-registration.entity';
export declare class User {
    id: number;
    name: string;
    userType: TipoUser;
    telephone: string;
    email: string;
    course: string | null;
    shift: Turno | null;
    campus: string | null;
    password: string;
    enrollments: Enrollment[];
    events: Event[];
    eventRegistrations: EventRegistration[];
    createdAt: Date;
    updatedAt: Date;
}
export type TipoUser = 'aluno' | 'professor' | 'admin';
export declare const TURNOS: readonly ["manha", "tarde", "noite", "integral"];
export type Turno = (typeof TURNOS)[number];
