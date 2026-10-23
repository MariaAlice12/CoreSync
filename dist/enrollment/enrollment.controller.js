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
exports.EnrollmentController = void 0;
const common_1 = require("@nestjs/common");
const enrollment_service_1 = require("./enrollment.service");
const create_enrollment_dto_1 = require("./dto/create-enrollment.dto");
const update_enrollment_dto_1 = require("./dto/update-enrollment.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let EnrollmentController = class EnrollmentController {
    constructor(enrollmentService) {
        this.enrollmentService = enrollmentService;
    }
    create(createEnrollmentDto, user) {
        return this.enrollmentService.create(createEnrollmentDto, user);
    }
    findAll(user, trainingId, course, shift, active) {
        return this.enrollmentService.findAll(user, {
            trainingId: trainingId ? Number(trainingId) : undefined,
            course,
            shift,
            active: active === undefined ? undefined : active === 'true',
        });
    }
    findMine(user) {
        return this.enrollmentService.findForUser(user.id);
    }
    findOne(id) {
        return this.enrollmentService.findOne(id);
    }
    update(id, updateEnrollmentDto, user) {
        return this.enrollmentService.update(id, updateEnrollmentDto, user);
    }
    remove(id, user) {
        return this.enrollmentService.remove(id, user);
    }
};
exports.EnrollmentController = EnrollmentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova matrícula' }),
    (0, swagger_1.ApiBody)({ type: create_enrollment_dto_1.CreateEnrollmentDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Matrícula criada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Já matriculado ou treino lotado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_enrollment_dto_1.CreateEnrollmentDto, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar matrículas (aluno vê só as suas; filtros por treino, curso, turno e status)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'trainingId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'course', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'shift', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'active', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de matrículas retornada com sucesso',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('trainingId')),
    __param(2, (0, common_1.Query)('course')),
    __param(3, (0, common_1.Query)('shift')),
    __param(4, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], EnrollmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Matrículas do usuário logado' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnrollmentController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar uma matrícula por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID da matrícula' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matrícula encontrada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Matrícula não encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EnrollmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Ativar/cancelar uma matrícula' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID da matrícula' }),
    (0, swagger_1.ApiBody)({ type: update_enrollment_dto_1.UpdateEnrollmentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matrícula atualizada com sucesso' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_enrollment_dto_1.UpdateEnrollmentDto, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover uma matrícula' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID da matrícula' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matrícula removida com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Matrícula não encontrada' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentController.prototype, "remove", null);
exports.EnrollmentController = EnrollmentController = __decorate([
    (0, swagger_1.ApiTags)('Matrículas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('enrollment'),
    __metadata("design:paramtypes", [enrollment_service_1.EnrollmentService])
], EnrollmentController);
//# sourceMappingURL=enrollment.controller.js.map