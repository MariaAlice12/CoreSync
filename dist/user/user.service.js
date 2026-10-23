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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("./entities/user.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let UserService = class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async create(dto, currentUser) {
        if (dto.userType === 'admin' && currentUser?.userType !== 'admin') {
            throw new common_1.ForbiddenException('Apenas administradores podem cadastrar outros administradores');
        }
        if (await this.findByEmail(dto.email)) {
            throw new common_1.ConflictException('E-mail já cadastrado');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({ ...dto, password: hashed });
        return this.userRepo.save(user);
    }
    findByEmail(email) {
        return this.userRepo.findOneBy({ email });
    }
    findAll(filters = {}) {
        const where = {};
        if (filters.userType)
            where.userType = filters.userType;
        if (filters.course)
            where.course = filters.course;
        if (filters.shift)
            where.shift = filters.shift;
        if (filters.campus)
            where.campus = filters.campus;
        return this.userRepo.find({ where, order: { name: 'ASC' } });
    }
    findByIds(ids) {
        if (ids.length === 0)
            return Promise.resolve([]);
        return this.userRepo.findBy({ id: (0, typeorm_1.In)(ids) });
    }
    async findIdsByType(userType) {
        const users = await this.userRepo.find({
            select: { id: true },
            where: { userType },
        });
        return users.map((u) => u.id);
    }
    async findOne(id) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user)
            throw new common_1.NotFoundException(`Usuário #${id} não encontrado`);
        return user;
    }
    async update(id, dto, currentUser) {
        const isAdmin = currentUser.userType === 'admin';
        if (!isAdmin && currentUser.id !== id) {
            throw new common_1.ForbiddenException('Você só pode alterar o próprio perfil');
        }
        if (dto.userType !== undefined && !isAdmin) {
            throw new common_1.ForbiddenException('Somente administradores podem alterar o tipo de usuário');
        }
        const user = await this.findOne(id);
        if (dto.email &&
            dto.email !== user.email &&
            (await this.findByEmail(dto.email))) {
            throw new common_1.ConflictException('E-mail já cadastrado');
        }
        const changes = { ...dto };
        if (dto.password)
            changes.password = await bcrypt.hash(dto.password, 10);
        Object.assign(user, changes);
        return this.userRepo.save(user);
    }
    async remove(id) {
        await this.findOne(id);
        return this.userRepo.delete(id);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map