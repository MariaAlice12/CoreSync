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
var StravaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StravaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const strava_entity_1 = require("./entities/strava.entity");
const strava_account_entity_1 = require("./entities/strava-account.entity");
const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth';
let StravaService = StravaService_1 = class StravaService {
    constructor(httpService, jwtService, activityRepo, accountRepo) {
        this.httpService = httpService;
        this.jwtService = jwtService;
        this.activityRepo = activityRepo;
        this.accountRepo = accountRepo;
        this.logger = new common_1.Logger(StravaService_1.name);
        this.baseUrl = 'https://www.strava.com/api/v3';
        this.clientId = process.env.STRAVA_CLIENT_ID ?? '';
        this.clientSecret = process.env.STRAVA_CLIENT_SECRET ?? '';
        this.redirectUri = process.env.STRAVA_REDIRECT_URI ??
            `${process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 8080}`}/strava/callback`;
    }
    frontendUrl(path) {
        const base = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',')[0];
        return `${base}${path}`;
    }
    getAuthorizeUrl(userId) {
        if (!this.clientId) {
            throw new common_1.BadRequestException('Integração com Strava não configurada (defina STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET)');
        }
        const state = this.jwtService.sign({ sub: userId, purpose: 'strava' }, { expiresIn: '10m' });
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            approval_prompt: 'auto',
            scope: 'read,activity:read_all',
            state,
        });
        return `${STRAVA_OAUTH_URL}/authorize?${params.toString()}`;
    }
    async handleCallback(code, state, scope) {
        let userId;
        try {
            const payload = this.jwtService.verify(state);
            if (payload.purpose !== 'strava')
                throw new Error('purpose');
            userId = payload.sub;
        }
        catch {
            throw new common_1.UnauthorizedException('Estado OAuth inválido ou expirado');
        }
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${STRAVA_OAUTH_URL}/token`, {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            grant_type: 'authorization_code',
        }));
        const account = (await this.accountRepo.findOne({ where: { user: { id: userId } } })) ??
            this.accountRepo.create({ user: { id: userId } });
        Object.assign(account, {
            athleteId: String(data.athlete?.id ?? ''),
            athleteName: data.athlete
                ? [data.athlete.firstname, data.athlete.lastname]
                    .filter(Boolean)
                    .join(' ')
                : null,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
            scope: scope ?? null,
        });
        await this.accountRepo.save(account);
        return account;
    }
    async status(userId) {
        const account = await this.accountRepo.findOne({
            where: { user: { id: userId } },
        });
        return {
            configured: !!this.clientId,
            connected: !!account,
            athleteName: account?.athleteName ?? null,
            connectedAt: account?.createdAt ?? null,
        };
    }
    async disconnect(userId) {
        const account = await this.accountRepo.findOne({
            where: { user: { id: userId } },
        });
        if (!account)
            return { connected: false };
        try {
            const token = await this.ensureAccessToken(account);
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${STRAVA_OAUTH_URL}/deauthorize`, null, {
                params: { access_token: token },
            }));
        }
        catch (err) {
            this.logger.warn(`Falha ao revogar acesso no Strava: ${String(err)}`);
        }
        await this.accountRepo.delete(account.id);
        return { connected: false };
    }
    async ensureAccessToken(account) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= account.expiresAt - 60) {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${STRAVA_OAUTH_URL}/token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: account.refreshToken,
            }));
            account.accessToken = response.data.access_token;
            account.refreshToken = response.data.refresh_token;
            account.expiresAt = response.data.expires_at;
            await this.accountRepo.save(account);
        }
        return account.accessToken;
    }
    static toDto(activity) {
        const { id, stravaId, name, distance, movingTime, elapsedTime } = activity;
        return {
            id,
            stravaId,
            name,
            distance,
            movingTime,
            elapsedTime,
            totalElevationGain: activity.totalElevationGain,
            type: activity.type,
            sportType: activity.sportType,
            averageSpeed: activity.averageSpeed,
            maxSpeed: activity.maxSpeed,
            averageHeartrate: activity.averageHeartrate,
            maxHeartrate: activity.maxHeartrate,
            averageCadence: activity.averageCadence,
            startDate: activity.startDate,
            pace: activity.distance > 0
                ? activity.movingTime / (activity.distance / 1000)
                : null,
        };
    }
    async findForUser(userId) {
        const activities = await this.activityRepo.find({
            where: { user: { id: userId } },
            order: { startDate: 'DESC' },
        });
        return activities.map(StravaService_1.toDto);
    }
    async syncActivities(userId, perPage = 30) {
        const account = await this.accountRepo.findOne({
            where: { user: { id: userId } },
        });
        if (!account) {
            throw new common_1.BadRequestException('Conecte sua conta do Strava antes de sincronizar');
        }
        const token = await this.ensureAccessToken(account);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/athlete/activities`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { per_page: Math.min(Math.max(perPage, 1), 200) },
        }));
        for (const act of response.data) {
            const existing = await this.activityRepo.findOne({
                where: { stravaId: act.id.toString() },
            });
            await this.activityRepo.save({
                ...(existing ?? {}),
                user: { id: userId },
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
                averageHeartrate: act.average_heartrate ?? null,
                maxHeartrate: act.max_heartrate ?? null,
                averageCadence: act.average_cadence ?? null,
                startDate: new Date(act.start_date),
            });
        }
        return this.findForUser(userId);
    }
};
exports.StravaService = StravaService;
exports.StravaService = StravaService = StravaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(strava_entity_1.Strava)),
    __param(3, (0, typeorm_1.InjectRepository)(strava_account_entity_1.StravaAccount)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StravaService);
//# sourceMappingURL=strava.service.js.map