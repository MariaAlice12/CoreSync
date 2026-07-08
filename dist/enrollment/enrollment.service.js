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
    async create(dto) {
        const user = await this.userService.findOne(dto.userId);
        const training = await this.trainingService.findOne(dto.trainingId);
        const enrollment = this.enrollmentRepo.create({ ...dto, user, training });
        return this.enrollmentRepo.save(enrollment);
    }
    findAll() {
        return this.enrollmentRepo.find();
    }
    async findOne(id) {
        const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
        if (!enrollment)
            throw new common_1.NotFoundException(`Matrícula #${id} não encontrada`);
        return enrollment;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.enrollmentRepo.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        return this.enrollmentRepo.delete(id);
    }
    async existsForUserAndTraining(userId, trainingId) {
        const count = await this.enrollmentRepo.count({
            where: { user: { id: userId }, training: { id: trainingId } },
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