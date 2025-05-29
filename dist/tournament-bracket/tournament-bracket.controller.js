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
exports.TournamentBracketController = void 0;
const common_1 = require("@nestjs/common");
const tournament_bracket_service_1 = require("./tournament-bracket.service");
const create_tournament_bracket_dto_1 = require("./dto/create-tournament-bracket.dto");
const update_tournament_bracket_dto_1 = require("./dto/update-tournament-bracket.dto");
let TournamentBracketController = class TournamentBracketController {
    constructor(tournamentBracketService) {
        this.tournamentBracketService = tournamentBracketService;
    }
    create(createTournamentBracketDto) {
        return this.tournamentBracketService.create(createTournamentBracketDto);
    }
    findAll() {
        return this.tournamentBracketService.findAll();
    }
    findOne(id) {
        return this.tournamentBracketService.findOne(+id);
    }
    update(id, updateTournamentBracketDto) {
        return this.tournamentBracketService.update(+id, updateTournamentBracketDto);
    }
    remove(id) {
        return this.tournamentBracketService.remove(+id);
    }
};
exports.TournamentBracketController = TournamentBracketController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tournament_bracket_dto_1.CreateTournamentBracketDto]),
    __metadata("design:returntype", void 0)
], TournamentBracketController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TournamentBracketController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentBracketController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tournament_bracket_dto_1.UpdateTournamentBracketDto]),
    __metadata("design:returntype", void 0)
], TournamentBracketController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentBracketController.prototype, "remove", null);
exports.TournamentBracketController = TournamentBracketController = __decorate([
    (0, common_1.Controller)('tournament-bracket'),
    __metadata("design:paramtypes", [tournament_bracket_service_1.TournamentBracketService])
], TournamentBracketController);
//# sourceMappingURL=tournament-bracket.controller.js.map