"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTournamentBracketDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_tournament_bracket_dto_1 = require("./create-tournament-bracket.dto");
class UpdateTournamentBracketDto extends (0, mapped_types_1.PartialType)(create_tournament_bracket_dto_1.CreateTournamentBracketDto) {
}
exports.UpdateTournamentBracketDto = UpdateTournamentBracketDto;
//# sourceMappingURL=update-tournament-bracket.dto.js.map