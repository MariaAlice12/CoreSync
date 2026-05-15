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
exports.StravaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const strava_entity_1 = require("./entities/strava.entity");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let StravaService = class StravaService {
    constructor(httpService, activityRepo) {
        this.httpService = httpService;
        this.activityRepo = activityRepo;
        this.baseUrl = 'https://www.strava.com/api/v3';
        this.accessToken = process.env.STRAVA_ACCESS_TOKEN ?? '';
        this.refreshToken = process.env.STRAVA_REFRESH_TOKEN ?? '';
        this.clientId = process.env.STRAVA_CLIENT_ID ?? '';
        this.clientSecret = process.env.STRAVA_CLIENT_SECRET ?? '';
        this.expiresAt = Number(process.env.STRAVA_EXPIRES_AT) || 0;
    }
    async ensureAccessToken() {
        const now = Math.floor(Date.now() / 1000);
        if (now >= this.expiresAt) {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://www.strava.com/oauth/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
            }));
            this.accessToken = response.data.access_token;
            this.refreshToken = response.data.refresh_token;
            this.expiresAt = response.data.expires_at;
        }
        return this.accessToken;
    }
    async findAll() {
        return this.activityRepo.find();
    }
    async syncActivities(perPage = 5) {
        const token = await this.ensureAccessToken();
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/athlete/activities?per_page=${perPage}`, { headers: { Authorization: `Bearer ${token}` } }));
        for (const act of response.data) {
            const exists = await this.activityRepo.findOne({
                where: { stravaId: act.id.toString() },
            });
            if (!exists) {
                const dto = {
                    stravaId: act.id.toString(),
                    name: act.name,
                    distance: act.distance,
                    movingTime: act.moving_time,
                    elapsedTime: act.elapsed_time,
                    totalElevationGain: act.total_elevation_gain,
                    type: act.type,
                    sportType: act.sport_type,
                    averageSpeed: act.average_speed,
                    maxSpeed: act.max_speed,
                    startDate: new Date(act.start_date),
                };
                await this.activityRepo.save(dto);
            }
        }
        return this.activityRepo.find();
    }
};
exports.StravaService = StravaService;
exports.StravaService = StravaService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(strava_entity_1.Strava)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        typeorm_2.Repository])
], StravaService);
//# sourceMappingURL=strava.service.js.map