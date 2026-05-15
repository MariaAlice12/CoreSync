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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_bracket_entity_1 = require("../tournament-bracket/entities/tournament-bracket.entity");
let EventService = class EventService {
    constructor(eventRepo, bracketRepository) {
        this.eventRepo = eventRepo;
        this.bracketRepository = bracketRepository;
    }
    async create(dto) {
        const event = this.eventRepo.create(dto);
        if (dto.bracketGenerated) {
            const bracket = this.bracketRepository.create({
                name: `${dto.title} - Bracket`,
            });
            event.tournamentBracket = await this.bracketRepository.save(bracket);
        }
        return this.eventRepo.save(event);
    }
    findAll() {
        return this.eventRepo.find();
    }
    async findOne(id) {
        const event = await this.eventRepo.findOneBy({ id });
        if (!event)
            throw new common_1.NotFoundException(`Evento #${id} não encontrado`);
        return event;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.eventRepo.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        return this.eventRepo.delete(id);
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(tournament_bracket_entity_1.TournamentBracket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EventService);
//# sourceMappingURL=event.service.js.map