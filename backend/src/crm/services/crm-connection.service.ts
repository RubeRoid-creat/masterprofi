import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CrmConnection, CrmType } from "../entities/crm-connection.entity";
import { AmoCrmService } from "./amocrm.service";
import { Bitrix24Service } from "./bitrix24.service";
import { LoggerService } from "../../logger/logger.service";
import * as crypto from "crypto";

@Injectable()
export class CrmConnectionService {
  private readonly encryptionKey = process.env.CRM_ENCRYPTION_KEY || "default-key-change-in-production";

  constructor(
    @InjectRepository(CrmConnection)
    private connectionRepository: Repository<CrmConnection>,
    private amoCrmService: AmoCrmService,
    private bitrix24Service: Bitrix24Service,
    private logger: LoggerService
  ) {}

  /**
   * Создать подключение к CRM
   */
  async createConnection(
    userId: string,
    crmType: CrmType,
    credentials: {
      clientId?: string;
      clientSecret?: string;
      authorizationCode?: string;
      apiUrl?: string;
      redirectUri?: string;
    }
  ): Promise<CrmConnection> {
    let accessToken: string;
    let refreshToken: string;
    let tokenExpiresAt: Date;

    if (crmType === CrmType.AMOCRM) {
      if (!credentials.authorizationCode || !credentials.clientId || !credentials.clientSecret) {
        throw new Error("Missing required credentials for AmoCRM");
      }

      const tokens = await this.amoCrmService.exchangeCodeForTokens(
        credentials.clientId,
        credentials.clientSecret,
        credentials.authorizationCode,
        credentials.redirectUri || `${process.env.FRONTEND_URL}/crm/callback`
      );

      accessToken = this.encrypt(tokens.access_token);
      refreshToken = this.encrypt(tokens.refresh_token);
      tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    } else if (crmType === CrmType.BITRIX24) {
      if (!credentials.authorizationCode || !credentials.clientId || !credentials.clientSecret || !credentials.apiUrl) {
        throw new Error("Missing required credentials for Bitrix24");
      }

      const domain = credentials.apiUrl.replace("https://", "").replace("http://", "").split("/")[0];
      const tokens = await this.bitrix24Service.exchangeCodeForTokens(
        credentials.clientId,
        credentials.clientSecret,
        credentials.authorizationCode,
        credentials.redirectUri || `${process.env.FRONTEND_URL}/crm/callback`,
        domain
      );

      accessToken = this.encrypt(tokens.access_token);
      refreshToken = this.encrypt(tokens.refresh_token);
      tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    } else {
      throw new Error(`CRM type ${crmType} not yet implemented`);
    }

    const connection = this.connectionRepository.create({
      userId,
      crmType,
      clientId: credentials.clientId,
      clientSecret: this.encrypt(credentials.clientSecret || ""),
      accessToken,
      refreshToken,
      tokenExpiresAt,
      apiUrl: credentials.apiUrl,
      isActive: true,
    });

    return this.connectionRepository.save(connection);
  }

  /**
   * Получить активное подключение пользователя
   */
  async getActiveConnection(userId: string, crmType?: CrmType): Promise<CrmConnection | null> {
    const where: any = { userId, isActive: true };
    if (crmType) {
      where.crmType = crmType;
    }

    let connection = await this.connectionRepository.findOne({ where });

    if (!connection) {
      return null;
    }

    if (this.isTokenExpired(connection)) {
      // Обновляем токен
      try {
        await this.refreshToken(connection);
        connection = await this.connectionRepository.findOne({
          where: { id: connection.id },
        });
      } catch (error) {
        this.logger.error("Failed to refresh token", error);
        // Деактивируем подключение при ошибке обновления токена
        connection.isActive = false;
        await this.connectionRepository.save(connection);
        return null;
      }
    }

    return connection;
  }

  /**
   * Обновить токен доступа
   */
  async refreshToken(connection: CrmConnection): Promise<void> {
    if (connection.crmType === CrmType.AMOCRM) {
      const decryptedRefreshToken = this.decrypt(connection.refreshToken);
      const decryptedClientSecret = this.decrypt(connection.clientSecret);

      const tokens = await this.amoCrmService.refreshAccessToken(
        connection.clientId,
        decryptedClientSecret,
        decryptedRefreshToken
      );

      connection.accessToken = this.encrypt(tokens.access_token);
      connection.refreshToken = this.encrypt(tokens.refresh_token);
      connection.tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      await this.connectionRepository.save(connection);
    } else if (connection.crmType === CrmType.BITRIX24) {
      const decryptedRefreshToken = this.decrypt(connection.refreshToken);
      const decryptedClientSecret = this.decrypt(connection.clientSecret);
      const domain = connection.apiUrl?.replace("https://", "").replace("http://", "").split("/")[0] || "";

      const tokens = await this.bitrix24Service.refreshAccessToken(
        connection.clientId,
        decryptedClientSecret,
        decryptedRefreshToken,
        domain
      );

      connection.accessToken = this.encrypt(tokens.access_token);
      connection.refreshToken = this.encrypt(tokens.refresh_token);
      connection.tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      await this.connectionRepository.save(connection);
    }
  }

  /**
   * Получить расшифрованный токен доступа
   */
  getDecryptedAccessToken(connection: CrmConnection): string {
    return this.decrypt(connection.accessToken);
  }

  /**
   * Получить URL для OAuth авторизации
   */
  getAuthUrl(crmType: CrmType, clientId: string, redirectUri: string, domain?: string): string {
    if (crmType === CrmType.AMOCRM) {
      return this.amoCrmService.getAuthUrl(clientId, redirectUri);
    } else if (crmType === CrmType.BITRIX24) {
      if (!domain) {
        throw new Error("Domain is required for Bitrix24");
      }
      return this.bitrix24Service.getAuthUrl(clientId, redirectUri, domain);
    }
    throw new Error(`CRM type ${crmType} not yet implemented`);
  }

  /**
   * Проверить, истек ли токен
   */
  private isTokenExpired(connection: CrmConnection): boolean {
    if (!connection.tokenExpiresAt) {
      return true;
    }
    // Обновляем токен за 5 минут до истечения
    return connection.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000;
  }

  /**
   * Шифрование данных
   */
  private encrypt(text: string): string {
    if (!text) return "";
    const cipher = crypto.createCipher("aes-256-cbc", this.encryptionKey);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  /**
   * Расшифровка данных
   */
  private decrypt(encryptedText: string): string {
    if (!encryptedText) return "";
    try {
      const decipher = crypto.createDecipher("aes-256-cbc", this.encryptionKey);
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      this.logger.error("Failed to decrypt CRM token", error);
      return "";
    }
  }
}

