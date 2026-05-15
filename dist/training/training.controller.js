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
exports.TrainingController = void 0;
const common_1 = require("@nestjs/common");
const training_service_1 = require("./training.service");
const create_training_dto_1 = require("./dto/create-training.dto");
const update_training_dto_1 = require("./dto/update-training.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TrainingController = class TrainingController {
    constructor(trainingService) {
        this.trainingService = trainingService;
    }
    create(createTrainingDto) {
        return this.trainingService.create(createTrainingDto);
    }
    findAll() {
        return this.trainingService.findAll();
    }
    findOne(id) {
        return this.trainingService.findOne(id);
    }
    update(id, updateTrainingDto) {
        return this.trainingService.update(id, updateTrainingDto);
    }
    remove(id) {
        return this.trainingService.remove(id);
    }
};
exports.TrainingController = TrainingController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo treino' }),
    (0, swagger_1.ApiBody)({ type: create_training_dto_1.CreateTrainingDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Treino criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_training_dto_1.CreateTrainingDto]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os treinos' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de treinos retornada com sucesso',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar um treino por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID do treino' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treino encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Treino não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar um treino' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID do treino' }),
    (0, swagger_1.ApiBody)({ type: update_training_dto_1.UpdateTrainingDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treino atualizado com sucesso' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_training_dto_1.UpdateTrainingDto]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover um treino' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID do treino' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treino removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Treino não encontrado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingController.prototype, "remove", null);
exports.TrainingController = TrainingController = __decorate([
    (0, swagger_1.ApiTags)('Treinos'),
    (0, common_1.Controller)('training'),
    __metadata("design:paramtypes", [training_service_1.TrainingService])
], TrainingController);
//# sourceMappingURL=training.controller.js.map