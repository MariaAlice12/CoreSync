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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const user_entity_1 = require("../../user/entities/user.entity");
const tournament_bracket_entity_1 = require("../../tournament-bracket/entities/tournament-bracket.entity");
const event_registration_entity_1 = require("../../event-registration/entities/event-registration.entity");
const event_photo_entity_1 = require("./event-photo.entity");
const typeorm_1 = require("typeorm");
let Event = class Event {
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Event.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.events, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], Event.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'event_organizers',
        joinColumn: { name: 'eventId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Event.prototype, "organizers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_registration_entity_1.EventRegistration, (reg) => reg.event),
    __metadata("design:type", Array)
], Event.prototype, "registrations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_photo_entity_1.EventPhoto, (photo) => photo.event),
    __metadata("design:type", Array)
], Event.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)({}),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({}),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Event.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Event.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tournament_bracket_entity_1.TournamentBracket, {
        nullable: true,
        cascade: true,
        eager: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'tournamentBracketId' }),
    __metadata("design:type", tournament_bracket_entity_1.TournamentBracket)
], Event.prototype, "tournamentBracket", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Event.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Event.prototype, "updatedAt", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)()
], Event);
//# sourceMappingURL=event.entity.js.map