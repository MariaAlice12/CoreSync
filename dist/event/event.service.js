"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const event_entity_1 = require("./entities/event.entity");
const event_photo_entity_1 = require("./entities/event-photo.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_bracket_entity_1 = require("../tournament-bracket/entities/tournament-bracket.entity");
const event_registration_entity_1 = require("../event-registration/entities/event-registration.entity");
const user_service_1 = require("../user/user.service");
const notification_service_1 = require("../notification/notification.service");
const storage_service_1 = require("../storage/storage.service");
let EventService = class EventService {
    constructor(eventRepo, bracketRepository, photoRepo, registrationRepo, userService, notificationService, storage) {
        this.eventRepo = eventRepo;
        this.bracketRepository = bracketRepository;
        this.photoRepo = photoRepo;
        this.registrationRepo = registrationRepo;
        this.userService = userService;
        this.notificationService = notificationService;
        this.storage = storage;
    }
    isManager(event, currentUser) {
        return (currentUser.userType === 'admin' ||
            event.user?.id === currentUser.id ||
            event.organizers?.some((o) => o.id === currentUser.id));
    }
    assertCanManage(event, currentUser) {
        if (!this.isManager(event, currentUser)) {
            throw new common_1.ForbiddenException('Apenas o criador, os organizadores ou um admin podem alterar este evento');
        }
    }
    async registeredUserIds(eventId) {
        const regs = await this.registrationRepo.find({
            where: { event: { id: eventId }, active: true },
        });
        return regs.map((r) => r.user.id);
    }
    describe(event) {
        const when = event.date
            ? new Date(event.date).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
            })
            : 'data a definir';
        return event.location ? `${when} — ${event.location}` : when;
    }
    async create(dto, currentUser) {
        const { organizerIds, bracketType, teamCount, ...rest } = dto;
        const event = this.eventRepo.create(rest);
        event.user = { id: currentUser.id };
        event.organizers = organizerIds?.length
            ? await this.userService.findByIds(organizerIds)
            : [await this.userService.findOne(currentUser.id)];
        if (bracketType) {
            const bracket = this.bracketRepository.create({
                name: `${dto.title} - Bracket`,
                type: bracketType,
                teamCount: teamCount ?? 2,
            });
            event.tournamentBracket = await this.bracketRepository.save(bracket);
        }
        const saved = await this.eventRepo.save(event);
        const athletes = await this.userService.findIdsByType('aluno');
        await this.notificationService.notifyUsers(athletes, {
            type: 'event_created',
            title: `Novo evento: ${saved.title}`,
            message: this.describe(saved),
            link: `/evento/${saved.id}`,
        });
        return this.findOne(saved.id);
    }
    findAll() {
        return this.eventRepo.find({ order: { date: 'ASC' } });
    }
    async findOne(id) {
        const event = await this.eventRepo.findOneBy({ id });
        if (!event)
            throw new common_1.NotFoundException(`Evento #${id} não encontrado`);
        return event;
    }
    async update(id, dto, currentUser) {
        const event = await this.findOne(id);
        this.assertCanManage(event, currentUser);
        const { organizerIds, bracketType, teamCount, ...rest } = dto;
        const scheduleChanged = (rest.date !== undefined &&
            new Date(rest.date).getTime() !== new Date(event.date).getTime()) ||
            (rest.location !== undefined && rest.location !== event.location);
        Object.assign(event, rest);
        if (organizerIds) {
            event.organizers = await this.userService.findByIds(organizerIds);
        }
        if (bracketType && !event.tournamentBracket) {
            event.tournamentBracket = await this.bracketRepository.save(this.bracketRepository.create({
                name: `${event.title} - Bracket`,
                type: bracketType,
                teamCount: teamCount ?? 2,
            }));
        }
        const saved = await this.eventRepo.save(event);
        if (scheduleChanged) {
            await this.notificationService.notifyUsers(await this.registeredUserIds(id), {
                type: 'event_updated',
                title: `Evento alterado: ${saved.title}`,
                message: `Agora: ${this.describe(saved)}`,
                link: `/evento/${saved.id}`,
            });
        }
        return saved;
    }
    async remove(id, currentUser) {
        const event = await this.findOne(id);
        this.assertCanManage(event, currentUser);
        const photos = await this.photoRepo.find({ where: { event: { id } } });
        await Promise.all(photos.map((p) => this.storage.remove(p.key)));
        return this.eventRepo.delete(id);
    }
    listPhotos(eventId) {
        return this.photoRepo.find({
            where: { event: { id: eventId } },
            order: { createdAt: 'DESC' },
        });
    }
    async addPhotos(eventId, files, currentUser) {
        const event = await this.findOne(eventId);
        const participants = await this.registeredUserIds(eventId);
        if (!this.isManager(event, currentUser) &&
            !participants.includes(currentUser.id)) {
            throw new common_1.ForbiddenException('Somente participantes e organizadores podem enviar fotos deste evento');
        }
        const photos = [];
        for (const file of files) {
            const stored = await this.storage.upload(file, `events/${eventId}`);
            photos.push(await this.photoRepo.save(this.photoRepo.create({
                event: { id: eventId },
                uploadedBy: { id: currentUser.id },
                ...stored,
            })));
        }
        await this.notificationService.notifyUsers(participants.filter((id) => id !== currentUser.id), {
            type: 'event_photo',
            title: `Novas fotos em ${event.title}`,
            message: `${files.length} foto(s) adicionada(s) ao repositório do evento`,
            link: `/evento/${eventId}`,
        });
        return photos;
    }
    async removePhoto(eventId, photoId, currentUser) {
        const event = await this.findOne(eventId);
        const photo = await this.photoRepo.findOne({
            where: { id: photoId, event: { id: eventId } },
        });
        if (!photo)
            throw new common_1.NotFoundException(`Foto #${photoId} não encontrada`);
        if (photo.uploadedBy?.id !== currentUser.id) {
            this.assertCanManage(event, currentUser);
        }
        await this.storage.remove(photo.key);
        return this.photoRepo.delete(photoId);
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(tournament_bracket_entity_1.TournamentBracket)),
    __param(2, (0, typeorm_1.InjectRepository)(event_photo_entity_1.EventPhoto)),
    __param(3, (0, typeorm_1.InjectRepository)(event_registration_entity_1.EventRegistration)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService,
        notification_service_1.NotificationService,
        storage_service_1.StorageService])
], EventService);
//# sourceMappingURL=event.service.js.map