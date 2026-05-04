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
exports.CreateTypeSanctionDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateTypeSanctionDto {
    nom;
    modeCalcul;
    montantFixe;
    pourcentage;
    joursDeGrace;
    actif;
}
exports.CreateTypeSanctionDto = CreateTypeSanctionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTypeSanctionDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ModeCalcul),
    __metadata("design:type", String)
], CreateTypeSanctionDto.prototype, "modeCalcul", void 0);
__decorate([
    (0, class_validator_1.IsDecimal)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTypeSanctionDto.prototype, "montantFixe", void 0);
__decorate([
    (0, class_validator_1.IsDecimal)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTypeSanctionDto.prototype, "pourcentage", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTypeSanctionDto.prototype, "joursDeGrace", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTypeSanctionDto.prototype, "actif", void 0);
//# sourceMappingURL=create-type-sanction.dto.js.map