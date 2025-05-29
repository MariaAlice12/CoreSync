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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEnrollmentDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_enrollment_dto_1 = require("./create-enrollment.dto");
const swagger_1 = require("@nestjs/swagger");
class UpdateEnrollmentDto extends (0, mapped_types_1.PartialType)(create_enrollment_dto_1.CreateEnrollmentDto) {
}
exports.UpdateEnrollmentDto = UpdateEnrollmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: Number }),
    __metadata("design:type", Number)
], UpdateEnrollmentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Boolean }),
    __metadata("design:type", Boolean)
], UpdateEnrollmentDto.prototype, "active", void 0);
//# sourceMappingURL=update-enrollment.dto.js.map