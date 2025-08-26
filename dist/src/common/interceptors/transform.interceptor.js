"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        return next.handle().pipe((0, operators_1.map)(data => {
            if (response.headersSent) {
                return data;
            }
            if (response.statusCode >= 400) {
                return data;
            }
            if (data && typeof data === 'object' && 'success' in data) {
                return data;
            }
            if (data instanceof Buffer || data instanceof ArrayBuffer) {
                return data;
            }
            const contentType = response.getHeader('content-type');
            if (contentType && contentType.toString().includes('text/html')) {
                return data;
            }
            const transformedResponse = {
                success: true,
                statusCode: response.statusCode,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                data: data,
            };
            if (data &&
                typeof data === 'object' &&
                'data' in data &&
                'meta' in data) {
                transformedResponse.data = data.data;
                transformedResponse['meta'] = data.meta;
            }
            return transformedResponse;
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map