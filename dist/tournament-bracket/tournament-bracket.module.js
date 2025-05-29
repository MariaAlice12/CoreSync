"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentBracketModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tournament_bracket_entity_1 = require("./entities/tournament-bracket.entity");
const tournament_bracket_service_1 = require("./tournament-bracket.service");
const tournament_bracket_controller_1 = require("./tournament-bracket.controller");
let TournamentBracketModule = class TournamentBracketModule {
};
exports.TournamentBracketModule = TournamentBracketModule;
exports.TournamentBracketModule = TournamentBracketModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tournament_bracket_entity_1.TournamentBracket])],
        controllers: [tournament_bracket_controller_1.TournamentBracketController],
        providers: [tournament_bracket_service_1.TournamentBracketService],
    })
], TournamentBracketModule);
//# sourceMappingURL=tournament-bracket.module.js.map