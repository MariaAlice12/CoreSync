"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const training_module_1 = require("./training/training.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("./user/user.module");
const enrollment_module_1 = require("./enrollment/enrollment.module");
const event_module_1 = require("./event/event.module");
const tournament_bracket_module_1 = require("./tournament-bracket/tournament-bracket.module");
const strava_module_1 = require("./strava/strava.module");
const event_registration_module_1 = require("./event-registration/event-registration.module");
const survey_module_1 = require("./survey/survey.module");
const analytics_module_1 = require("./analytics/analytics.module");
const data_source_1 = require("./database/data-source");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            auth_module_1.AuthModule,
            typeorm_1.TypeOrmModule.forRoot(data_source_1.dataSourceOptions),
            training_module_1.TrainingModule,
            user_module_1.UserModule,
            enrollment_module_1.EnrollmentModule,
            event_module_1.EventModule,
            tournament_bracket_module_1.TournamentBracketModule,
            strava_module_1.StravaModule,
            event_registration_module_1.EventRegistrationModule,
            survey_module_1.SurveyModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map