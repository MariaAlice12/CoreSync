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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const enrollment_entity_1 = require("./entities/enrollment.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../user/user.service");
const training_service_1 = require("../training/training.service");
let EnrollmentService = class EnrollmentService {
    constructor(enrollmentRepo, userService, trainingService) {
        this.enrollmentRepo = enrollmentRepo;
        this.userService = userService;
        this.trainingService = trainingService;
    }
    async assertHasVacancy(training) {
        const active = await this.enrollmentRepo.count({
            where: { training: { id: training.id }, active: true },
        });
        if (active >= training.maxStudents) {
            throw new common_1.ConflictException(`Treino de ${training.modality} está lotado (${training.maxStudents} vagas)`);
        }
    }
    assertCanManage(enrollment, currentUser) {
        if (currentUser.userType === 'admin')
            return;
        if (enrollment.user.id === currentUser.id)
            return;
        if (currentUser.userType === 'professor' &&
            enrollment.training.professor?.id === currentUser.id) {
            return;
        }
        throw new common_1.ForbiddenException('Você não pode alterar esta matrícula');
    }
    async create(dto, currentUser) {
        const userId = currentUser.userType === 'aluno' || !dto.userId
            ? currentUser.id
            : dto.userId;
        const user = await this.userService.findOne(userId);
        const training = await this.trainingService.findOne(dto.trainingId);
        if (!training.active) {
            throw new common_1.BadRequestException('Este treino está desativado');
        }
        const existing = await this.enrollmentRepo.findOne({
            where: { user: { id: userId }, training: { id: training.id } },
        });
        if (existing?.active) {
            throw new common_1.ConflictException('Usuário já está matriculado neste treino');
        }
        await this.assertHasVacancy(training);
        if (existing) {
            existing.active = true;
            return this.enrollmentRepo.save(existing);
        }
        const enrollment = this.enrollmentRepo.create({
            user,
            training,
            active: dto.active ?? true,
        });
        return this.enrollmentRepo.save(enrollment);
    }
    findAll(currentUser, filters = {}) {
        const where = {};
        const userWhere = {};
        if (currentUser.userType === 'aluno')
            userWhere.id = currentUser.id;
        if (filters.course)
            userWhere.course = filters.course;
        if (filters.shift)
            userWhere.shift = filters.shift;
        if (Object.keys(userWhere).length)
            where.user = userWhere;
        if (filters.trainingId)
            where.training = { id: filters.trainingId };
        if (filters.active !== undefined)
            where.active = filters.active;
        return this.enrollmentRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    findForUser(userId) {
        return this.enrollmentRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
        if (!enrollment)
            throw new common_1.NotFoundException(`Matrícula #${id} não encontrada`);
        return enrollment;
    }
    async update(id, dto, currentUser) {
        const enrollment = await this.findOne(id);
        this.assertCanManage(enrollment, currentUser);
        if (dto.active && !enrollment.active) {
            await this.assertHasVacancy(enrollment.training);
        }
        enrollment.active = dto.active;
        return this.enrollmentRepo.save(enrollment);
    }
    async remove(id, currentUser) {
        const enrollment = await this.findOne(id);
        this.assertCanManage(enrollment, currentUser);
        return this.enrollmentRepo.delete(id);
    }
    async existsForUserAndTraining(userId, trainingId) {
        const count = await this.enrollmentRepo.count({
            where: { user: { id: userId }, training: { id: trainingId } },
        });
        return count > 0;
    }
    async isActivelyEnrolled(userId, trainingId) {
        const count = await this.enrollmentRepo.count({
            where: {
                user: { id: userId },
                training: { id: trainingId },
                active: true,
            },
        });
        return count > 0;
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService,
        training_service_1.TrainingService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map