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
exports.AssignRoleDto = exports.Role = void 0;
const class_validator_1 = require("class-validator");
var Role;
(function (Role) {
    Role["PRESIDENT"] = "PRESIDENT";
    Role["TRESORIER"] = "TRESORIER";
    Role["SECRETAIRE"] = "SECRETAIRE";
    Role["COMMISSAIRE"] = "COMMISSAIRE";
    Role["MEMBRE"] = "MEMBRE";
})(Role || (exports.Role = Role = {}));
class AssignRoleDto {
    userId;
    role;
    motif;
}
exports.AssignRoleDto = AssignRoleDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Role),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "motif", void 0);
//# sourceMappingURL=assign-role.dto.js.map