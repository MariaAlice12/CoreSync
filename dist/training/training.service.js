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
const enrollment_entity_1 = require("../enrollment/entities/enrollment.entity");
const notification_service_1 = require("../notification/notification.service");
const SCHEDULE_FIELDS = ['hour', 'address', 'weekdays', 'active'];
let TrainingService = class TrainingService {
    constructor(trainingRepo, enrollmentRepo, userService, notificationService) {
        this.trainingRepo = trainingRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.userService = userService;
        this.notificationService = notificationService;
    }
    async resolveProfessor(professorId) {
        const professor = await this.userService.findOne(professorId);
        if (professor.userType !== 'professor') {
            throw new common_1.BadRequestException(`Usuário #${professorId} não é um professor`);
        }
        return professor;
    }
    assertCanManage(training, currentUser) {
        if (currentUser.userType === 'admin')
            return;
        if (currentUser.userType === 'professor' &&
            training.professor?.id === currentUser.id) {
            return;
        }
        throw new common_1.ForbiddenException('Você só pode alterar treinos dos quais é o professor responsável');
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
        const training = await this.trainingRepo.save(this.trainingRepo.create({ ...rest, professor }));
        if (training.active) {
            const athletes = await this.userService.findIdsByType('aluno');
            await this.notificationService.notifyUsers(athletes, {
                type: 'training_created',
                title: `Novo treino de ${training.modality}`,
                message: `${training.weekdays.join(', ')} às ${training.hour} — ${training.address}`,
                link: '/dashboard/atleta',
            });
        }
        return training;
    }
    findAll(filters = {}) {
        const where = {};
        if (filters.modality)
            where.modality = filters.modality;
        if (filters.level)
            where.level = filters.level;
        if (filters.campus)
            where.campus = filters.campus;
        if (filters.active !== undefined)
            where.active = filters.active;
        if (filters.professorId)
            where.professor = { id: filters.professorId };
        return this.trainingRepo.find({ where, order: { modality: 'ASC' } });
    }
    async findOne(id) {
        const training = await this.trainingRepo.findOneBy({ id });
        if (!training)
            throw new common_1.NotFoundException(`Treino #${id} não encontrado`);
        return training;
    }
    async update(id, dto, currentUser) {
        const training = await this.findOne(id);
        this.assertCanManage(training, currentUser);
        const { professorId, ...rest } = dto;
        if (professorId !== undefined) {
            if (currentUser.userType !== 'admin') {
                throw new common_1.ForbiddenException('Somente admins podem reatribuir o professor de um treino');
            }
            training.professor = await this.resolveProfessor(professorId);
        }
        const scheduleChanged = SCHEDULE_FIELDS.some((f) => rest[f] !== undefined &&
            JSON.stringify(rest[f]) !== JSON.stringify(training[f]));
        Object.assign(training, rest);
        const saved = await this.trainingRepo.save(training);
        if (scheduleChanged) {
            await this.notificationService.notifyUsers(await this.activeStudentIds(id), {
                type: 'training_updated',
                title: `Treino de ${saved.modality} foi alterado`,
                message: saved.active
                    ? `Agora: ${saved.weekdays.join(', ')} às ${saved.hour} — ${saved.address}`
                    : 'O treino foi desativado.',
                link: '/agenda',
            });
        }
        return saved;
    }
    async remove(id, currentUser) {
        const training = await this.findOne(id);
        this.assertCanManage(training, currentUser);
        return this.trainingRepo.delete(id);
    }
    async activeStudentIds(trainingId) {
        const enrollments = await this.enrollmentRepo.find({
            where: { training: { id: trainingId }, active: true },
        });
        return enrollments.map((e) => e.user.id);
    }
};
exports.TrainingService = TrainingService;
exports.TrainingService = TrainingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(training_entity_1.Training)),
    __param(1, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService,
        notification_service_1.NotificationService])
], TrainingService);
//# sourceMappingURL=training.service.js.map