"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStravaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_strava_dto_1 = require("./create-strava.dto");
class UpdateStravaDto extends (0, swagger_1.PartialType)(create_strava_dto_1.CreateStravaDto) {
}
exports.UpdateStravaDto = UpdateStravaDto;
//# sourceMappingURL=update-strava.dto.js.map