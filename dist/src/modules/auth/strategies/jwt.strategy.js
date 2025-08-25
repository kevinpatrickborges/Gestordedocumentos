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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(authService, configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (request) => {
                    let token = null;
                    this.logger.debug(`[JwtStrategy] Tentando extrair token JWT`);
                    if (request && request.cookies) {
                        token = request.cookies['access_token'];
                        if (token) {
                            this.logger.debug(`[JwtStrategy] Token encontrado no cookie 'access_token'`);
                        }
                        else {
                            this.logger.debug(`[JwtStrategy] Nenhum token encontrado no cookie 'access_token'`);
                        }
                    }
                    else {
                        this.logger.debug(`[JwtStrategy] Request não possui cookies`);
                    }
                    if (!token) {
                        token = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(request);
                        if (token) {
                            this.logger.debug(`[JwtStrategy] Token encontrado no header Authorization`);
                        }
                        else {
                            this.logger.debug(`[JwtStrategy] Nenhum token encontrado no header Authorization`);
                        }
                    }
                    if (!token) {
                        this.logger.warn(`[JwtStrategy] Nenhum token JWT encontrado na requisição`);
                    }
                    return token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('auth.jwt.secret') ||
                configService.get('JWT_SECRET'),
        });
        this.authService = authService;
        this.configService = configService;
        this.logger = new common_1.Logger(JwtStrategy_1.name);
    }
    async validate(payload) {
        this.logger.debug(`Validando payload: ${JSON.stringify(payload)}`);
        const user = await this.authService.validateJwtPayload(payload);
        if (!user) {
            this.logger.warn(`Validação de JWT falhou para payload: ${JSON.stringify(payload)}`);
            throw new common_1.UnauthorizedException('Usuário não encontrado ou token inválido');
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map