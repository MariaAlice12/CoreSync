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
exports.EventController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const event_service_1 = require("./event.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_PHOTOS_PER_UPLOAD = 10;
let EventController = class EventController {
    constructor(eventService) {
        this.eventService = eventService;
    }
    create(createEventDto, user) {
        return this.eventService.create(createEventDto, user);
    }
    findAll() {
        return this.eventService.findAll();
    }
    findOne(id) {
        return this.eventService.findOne(id);
    }
    update(id, updateEventDto, user) {
        return this.eventService.update(id, updateEventDto, user);
    }
    remove(id, user) {
        return this.eventService.remove(id, user);
    }
    listPhotos(id) {
        return this.eventService.listPhotos(id);
    }
    uploadPhotos(id, files, user) {
        if (!files?.length) {
            throw new common_1.BadRequestException('Envie ao menos uma imagem no campo "photos"');
        }
        return this.eventService.addPhotos(id, files, user);
    }
    removePhoto(id, photoId, user) {
        return this.eventService.removePhoto(id, photoId, user);
    }
};
exports.EventController = EventController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'professor'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo evento (admin/professor)' }),
    (0, swagger_1.ApiBody)({ type: create_event_dto_1.CreateEventDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Evento criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, Object]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os eventos' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de eventos retornada com sucesso',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar um evento por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID do evento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evento encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Evento não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Atualizar um evento (criador, organizador ou admin)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID do evento' }),
    (0, swagger_1.ApiBody)({ type: update_event_dto_1.UpdateEventDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evento atualizado com sucesso' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_dto_1.UpdateEventDto, Object]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remover um evento (criador, organizador ou admin)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID do evento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Evento removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Evento não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id/photos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar fotos do repositório do evento' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "listPhotos", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':id/photos'),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar fotos ao repositório do evento (participantes e organizadores)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                photos: { type: 'array', items: { type: 'string', format: 'binary' } },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('photos', MAX_PHOTOS_PER_UPLOAD, {
        limits: { fileSize: MAX_PHOTO_SIZE },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Apenas imagens são permitidas'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array, Object]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "uploadPhotos", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id/photos/:photoId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover uma foto do evento' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiParam)({ name: 'photoId', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('photoId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "removePhoto", null);
exports.EventController = EventController = __decorate([
    (0, swagger_1.ApiTags)('Eventos'),
    (0, common_1.Controller)('event'),
    __metadata("design:paramtypes", [event_service_1.EventService])
], EventController);
//# sourceMappingURL=event.controller.js.map