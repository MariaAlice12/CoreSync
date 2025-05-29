"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentBracketService = void 0;
const common_1 = require("@nestjs/common");
let TournamentBracketService = class TournamentBracketService {
    constructor() {
        this.brackets = [];
        this.idCounter = 1;
    }
    create(dto) {
        const newBracket = { id: this.idCounter++, ...dto };
        this.brackets.push(newBracket);
        return newBracket;
    }
    findAll() {
        return this.brackets;
    }
    findOne(id) {
        return this.brackets.find(b => b.id === id);
    }
    update(id, dto) {
        const index = this.brackets.findIndex(b => b.id === id);
        if (index === -1)
            return null;
        this.brackets[index] = { ...this.brackets[index], ...dto };
        return this.brackets[index];
    }
    remove(id) {
        const index = this.brackets.findIndex(b => b.id === id);
        if (index === -1)
            return null;
        const deleted = this.brackets.splice(index, 1);
        return deleted[0];
    }
};
exports.TournamentBracketService = TournamentBracketService;
exports.TournamentBracketService = TournamentBracketService = __decorate([
    (0, common_1.Injectable)()
], TournamentBracketService);
//# sourceMappingURL=tournament-bracket.service.js.map