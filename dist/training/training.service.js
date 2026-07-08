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
exports.TrainingService = void 0;
const common_1 = require("@nestjs/common");
const training_entity_1 = require("./entities/training.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../user/user.service");
let TrainingService = class TrainingService {
    constructor(trainingRepo, userService) {
        this.trainingRepo = trainingRepo;
        this.userService = userService;
    }
    async resolveProfessor(professorId) {
        const professor = await this.userService.findOne(professorId);
        if (professor.userType !== 'professor') {
            throw new common_1.BadRequestException(`Usuário #${professorId} não é um professor`);
        }
        return professor;
    }
    async create(dto, currentUser) {
        const { professorId, ...rest } = dto;
        if (currentUser.userType === 'aluno') {
            throw new common_1.ForbiddenException('Alunos não podem criar treinos');
        }
        let professor;
        if (currentUser.userType === 'professor') {
            professor = await this.userService.findOne(currentUser.id);
        }
        else {
            if (!professorId) {
                throw new common_1.BadRequestException('professorId é obrigatório quando o treino é criado por um admin');
            }
            professor = await this.resolveProfessor(professorId);
        }
        const training = this.trainingRepo.create({ ...rest, professor });
        return this.trainingRepo.save(training);
    }
    findAll() {
        return this.trainingRepo.find();
    }
    async findOne(id) {
        const training = await this.trainingRepo.findOneBy({ id });
        if (!training)
            throw new common_1.NotFoundException(`Treino #${id} não encontrado`);
        return training;
    }
    async update(id, dto, currentUser) {
        const training = await this.findOne(id);
        const { professorId, ...rest } = dto;
        if (professorId !== undefined) {
            if (currentUser.userType !== 'admin') {
                throw new common_1.ForbiddenException('Somente admins podem reatribuir o professor de um treino');
            }
            training.professor = await this.resolveProfessor(professorId);
        }
        Object.assign(training, rest);
        return this.trainingRepo.save(training);
    }
    async remove(id) {
        await this.findOne(id);
        return this.trainingRepo.delete(id);
    }
};
exports.TrainingService = TrainingService;
exports.TrainingService = TrainingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(training_entity_1.Training)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService])
], TrainingService);
//# sourceMappingURL=training.service.js.map