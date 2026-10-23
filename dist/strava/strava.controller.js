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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let StravaController = class StravaController {
    constructor(stravaService) {
        this.stravaService = stravaService;
    }
    connect(user) {
        return { url: this.stravaService.getAuthorizeUrl(user.id) };
    }
    async callback(res, code, state, scope, error) {
        if (error || !code || !state) {
            return res.redirect(this.stravaService.frontendUrl('/perfil?strava=denied'));
        }
        try {
            await this.stravaService.handleCallback(code, state, scope);
            return res.redirect(this.stravaService.frontendUrl('/perfil?strava=connected'));
        }
        catch {
            return res.redirect(this.stravaService.frontendUrl('/perfil?strava=error'));
        }
    }
    status(user) {
        return this.stravaService.status(user.id);
    }
    disconnect(user) {
        return this.stravaService.disconnect(user.id);
    }
    syncActivities(user, perPage) {
        return this.stravaService.syncActivities(user.id, Number(perPage) || 30);
    }
    findMine(user) {
        return this.stravaService.findForUser(user.id);
    }
    findForUser(id) {
        return this.stravaService.findForUser(id);
    }
};
exports.StravaController = StravaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('connect'),
    (0, swagger_1.ApiOperation)({
        summary: 'URL de autorização OAuth do Strava para o usuário logado',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StravaController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, swagger_1.ApiOperation)({
        summary: 'Callback OAuth do Strava (redireciona ao frontend)',
    }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('code')),
    __param(2, (0, common_1.Query)('state')),
    __param(3, (0, common_1.Query)('scope')),
    __param(4, (0, common_1.Query)('error')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StravaController.prototype, "callback", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Situação da conexão com o Strava do usuário logado',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StravaController.prototype, "status", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('disconnect'),
    (0, swagger_1.ApiOperation)({ summary: 'Desconectar a conta do Strava' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StravaController.prototype, "disconnect", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('sync'),
    (0, swagger_1.ApiOperation)({
        summary: 'Sincronizar últimas atividades do Strava do usuário logado',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'perPage',
        required: false,
        type: Number,
        description: 'Quantidade de atividades para sincronizar (padrão 30)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Atividades sincronizadas',
        type: [create_strava_dto_1.StravaActivityDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('perPage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StravaController.prototype, "syncActivities", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Atividades do Strava do usuário logado' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de atividades',
        type: [create_strava_dto_1.StravaActivityDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StravaController.prototype, "findMine", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'professor'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('user/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Atividades do Strava de um atleta (professor/admin)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], StravaController.prototype, "findForUser", null);
exports.StravaController = StravaController = __decorate([
    (0, swagger_1.ApiTags)('Strava'),
    (0, common_1.Controller)('strava'),
    __metadata("design:paramtypes", [strava_service_1.StravaService])
], StravaController);
//# sourceMappingURL=strava.controller.js.map