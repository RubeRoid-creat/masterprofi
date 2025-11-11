import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET") || "dev-secret-key",
    });
  }

  async validate(payload: any) {
    // Возвращаем и id и userId для совместимости с контроллерами
    return { 
      id: payload.sub, 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
