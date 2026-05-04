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
exports.CreatePretDto = exports.CoEmprunteurDto = exports.GarantieDto = exports.TypeGarantie = exports.TypePret = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TypePret;
(function (TypePret) {
    TypePret["ORDINAIRE"] = "ORDINAIRE";
    TypePret["SOCIAL"] = "SOCIAL";
    TypePret["URGENT"] = "URGENT";
    TypePret["INVESTISSEMENT"] = "INVESTISSEMENT";
    TypePret["SOLIDARITE"] = "SOLIDARITE";
})(TypePret || (exports.TypePret = TypePret = {}));
var TypeGarantie;
(function (TypeGarantie) {
    TypeGarantie["MATERIELLE"] = "MATERIELLE";
    TypeGarantie["CAUTION_SOLIDAIRE"] = "CAUTION_SOLIDAIRE";
    TypeGarantie["EPARGNE_BLOQUEE"] = "EPARGNE_BLOQUEE";
    TypeGarantie["SALAIRE"] = "SALAIRE";
})(TypeGarantie || (exports.TypeGarantie = TypeGarantie = {}));
class GarantieDto {
    type;
    description;
    valeurEstimee;
    documentUrl;
}
exports.GarantieDto = GarantieDto;
__decorate([
    (0, class_validator_1.IsEnum)(TypeGarantie),
    __metadata("design:type", String)
], GarantieDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GarantieDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GarantieDto.prototype, "valeurEstimee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GarantieDto.prototype, "documentUrl", void 0);
class CoEmprunteurDto {
    membreId;
    partResponsabilite;
}
exports.CoEmprunteurDto = CoEmprunteurDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CoEmprunteurDto.prototype, "membreId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CoEmprunteurDto.prototype, "partResponsabilite", void 0);
class CreatePretDto {
    emprunteurId;
    type;
    montant;
    tauxInteret;
    dureeEnMois;
    motif;
    garanties;
    coEmprunteurs;
    notes;
}
exports.CreatePretDto = CreatePretDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePretDto.prototype, "emprunteurId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TypePret),
    __metadata("design:type", String)
], CreatePretDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePretDto.prototype, "montant", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePretDto.prototype, "tauxInteret", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePretDto.prototype, "dureeEnMois", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePretDto.prototype, "motif", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GarantieDto),
    __metadata("design:type", Array)
], CreatePretDto.prototype, "garanties", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CoEmprunteurDto),
    __metadata("design:type", Array)
], CreatePretDto.prototype, "coEmprunteurs", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePretDto.prototype, "notes", void 0);
//# sourceMappingURL=create-pret.dto.js.map