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
exports.TournamentBracketService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_bracket_entity_1 = require("./entities/tournament-bracket.entity");
let TournamentBracketService = class TournamentBracketService {
    constructor(bracketRepo) {
        this.bracketRepo = bracketRepo;
    }
    create(dto) {
        const bracket = this.bracketRepo.create(dto);
        return this.bracketRepo.save(bracket);
    }
    findAll() {
        return this.bracketRepo.find();
    }
    async findOne(id) {
        const bracket = await this.bracketRepo.findOneBy({ id });
        if (!bracket)
            throw new common_1.NotFoundException(`Chave #${id} não encontrada`);
        return bracket;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.bracketRepo.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        return this.bracketRepo.delete(id);
    }
};
exports.TournamentBracketService = TournamentBracketService;
exports.TournamentBracketService = TournamentBracketService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tournament_bracket_entity_1.TournamentBracket)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TournamentBracketService);
//# sourceMappingURL=tournament-bracket.service.js.map