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
exports.StravaController = void 0;
const common_1 = require("@nestjs/common");
const strava_service_1 = require("./strava.service");
const swagger_1 = require("@nestjs/swagger");
const create_strava_dto_1 = require("./dto/create-strava.dto");
const class_transformer_1 = require("class-transformer");
let StravaController = class StravaController {
    constructor(stravaService) {
        this.stravaService = stravaService;
    }
    async syncActivities(perPage) {
        const activities = await this.stravaService.syncActivities(perPage || 5);
        return (0, class_transformer_1.plainToInstance)(create_strava_dto_1.CreateStravaDto, activities);
    }
    async findAll() {
        const activities = await this.stravaService.findAll();
        return (0, class_transformer_1.plainToInstance)(create_strava_dto_1.CreateStravaDto, activities);
    }
};
exports.StravaController = StravaController;
__decorate([
    (0, common_1.Get)('sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Sincronizar últimas atividades do Strava' }),
    (0, swagger_1.ApiQuery)({
        name: 'perPage',
        required: false,
        type: Number,
        description: 'Quantidade de atividades para sincronizar',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Atividades sincronizadas',
        type: [create_strava_dto_1.CreateStravaDto],
    }),
    __param(0, (0, common_1.Query)('perPage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StravaController.prototype, "syncActivities", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as atividades do Strava' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de atividades',
        type: [create_strava_dto_1.CreateStravaDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StravaController.prototype, "findAll", null);
exports.StravaController = StravaController = __decorate([
    (0, swagger_1.ApiTags)('Strava'),
    (0, common_1.Controller)('strava'),
    __metadata("design:paramtypes", [strava_service_1.StravaService])
], StravaController);
//# sourceMappingURL=strava.controller.js.map