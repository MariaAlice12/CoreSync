import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    create(createEventDto: CreateEventDto, user: CurrentUserPayload): Promise<import("./entities/event.entity").Event>;
    findAll(): Promise<import("./entities/event.entity").Event[]>;
    findOne(id: number): Promise<import("./entities/event.entity").Event>;
    update(id: number, updateEventDto: UpdateEventDto, user: CurrentUserPayload): Promise<import("./entities/event.entity").Event>;
    remove(id: number, user: CurrentUserPayload): Promise<import("typeorm").DeleteResult>;
    listPhotos(id: number): Promise<import("./entities/event-photo.entity").EventPhoto[]>;
    uploadPhotos(id: number, files: Express.Multer.File[], user: CurrentUserPayload): Promise<import("./entities/event-photo.entity").EventPhoto[]>;
    removePhoto(id: number, photoId: number, user: CurrentUserPayload): Promise<import("typeorm").DeleteResult>;
}
