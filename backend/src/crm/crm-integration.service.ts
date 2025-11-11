import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoggerService } from "../logger/logger.service";
import { CrmConnection, CrmType } from "./entities/crm-connection.entity";
import { AmoCrmService } from "./services/amocrm.service";
import { Bitrix24Service } from "./services/bitrix24.service";
import { CrmConnectionService } from "./services/crm-connection.service";

/**
 * Сервис интеграции с внешними CRM системами
 * Поддерживает AmoCRM и Bitrix24
 */
@Injectable()
export class CrmIntegrationService {
  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(CrmConnection)
    private connectionRepository: Repository<CrmConnection>,
    private amoCrmService: AmoCrmService,
    private bitrix24Service: Bitrix24Service,
    private connectionService: CrmConnectionService
  ) {}

  /**
   * Получить все данные из внешней CRM
   */
  async fetchAllData(
    userId: string,
    crmType?: string
  ): Promise<{
    contacts: any[];
    deals: any[];
    tasks: any[];
    communications: any[];
    products: any[];
  }> {
    this.logger.log(
      `Fetching all data from CRM: ${crmType || "default"} for user ${userId}`
    );

    const connection = await this.connectionService.getActiveConnection(
      userId,
      crmType as CrmType
    );

    if (!connection) {
      throw new NotFoundException(
        `No active CRM connection found for user ${userId}`
      );
    }

    if (connection.crmType === CrmType.AMOCRM) {
      // Получаем расшифрованный токен
      const accessToken = this.connectionService.getDecryptedAccessToken(connection);

      // Получаем данные из AmoCRM
      const [contacts, deals, tasks] = await Promise.all([
        this.amoCrmService.getContacts(connection, accessToken),
        this.amoCrmService.getDeals(connection, accessToken),
        this.amoCrmService.getTasks(connection, accessToken),
      ]);

      // Преобразуем в наш формат
      return {
        contacts: contacts.map((c) =>
          this.amoCrmService.transformContact(c, connection.crmType)
        ),
        deals: deals.map((d) =>
          this.amoCrmService.transformDeal(d, connection.crmType)
        ),
        tasks: tasks.map((t) =>
          this.amoCrmService.transformTask(t, connection.crmType)
        ),
        communications: [], // TODO: Реализовать получение коммуникаций
        products: [], // TODO: Реализовать получение продуктов
      };
    } else if (connection.crmType === CrmType.BITRIX24) {
      // Получаем расшифрованный токен
      const accessToken = this.connectionService.getDecryptedAccessToken(connection);

      // Получаем данные из Bitrix24
      const [contacts, deals, tasks] = await Promise.all([
        this.bitrix24Service.getContacts(connection, accessToken),
        this.bitrix24Service.getDeals(connection, accessToken),
        this.bitrix24Service.getTasks(connection, accessToken),
      ]);

      // Преобразуем в наш формат
      return {
        contacts: contacts.map((c) =>
          this.bitrix24Service.transformContact(c, connection.crmType)
        ),
        deals: deals.map((d) =>
          this.bitrix24Service.transformDeal(d, connection.crmType)
        ),
        tasks: tasks.map((t) =>
          this.bitrix24Service.transformTask(t, connection.crmType)
        ),
        communications: [],
        products: [],
      };
    }

    // Для других CRM систем
    return {
      contacts: [],
      deals: [],
      tasks: [],
      communications: [],
      products: [],
    };
  }

  /**
   * Получить изменения с указанного времени
   */
  async fetchChanges(
    userId: string,
    crmType: string | undefined,
    since: Date,
    entityTypes?: string[]
  ): Promise<{
    contacts: any[];
    deals: any[];
    tasks: any[];
    communications: any[];
    products: any[];
  }> {
    this.logger.log(
      `Fetching changes from CRM ${crmType} since ${since.toISOString()} for user ${userId}`
    );

    const connection = await this.connectionService.getActiveConnection(
      userId,
      crmType as CrmType
    );

    if (!connection) {
      throw new NotFoundException(
        `No active CRM connection found for user ${userId}`
      );
    }

    if (connection.crmType === CrmType.AMOCRM) {
      const results: any = {
        contacts: [],
        deals: [],
        tasks: [],
        communications: [],
        products: [],
      };

      // Получаем расшифрованный токен
      const accessToken = this.connectionService.getDecryptedAccessToken(connection);

      // Получаем изменения только для запрошенных типов
      if (!entityTypes || entityTypes.includes("contacts")) {
        const contacts = await this.amoCrmService.getContactsChangedSince(
          connection,
          accessToken,
          since
        );
        results.contacts = contacts.map((c) =>
          this.amoCrmService.transformContact(c, connection.crmType)
        );
      }

      if (!entityTypes || entityTypes.includes("deals")) {
        const deals = await this.amoCrmService.getDealsChangedSince(
          connection,
          accessToken,
          since
        );
        results.deals = deals.map((d) =>
          this.amoCrmService.transformDeal(d, connection.crmType)
        );
      }

      if (!entityTypes || entityTypes.includes("tasks")) {
        const tasks = await this.amoCrmService.getTasks(connection, accessToken, since);
        results.tasks = tasks.map((t) =>
          this.amoCrmService.transformTask(t, connection.crmType)
        );
      }

      return results;
    } else if (connection.crmType === CrmType.BITRIX24) {
      const results: any = {
        contacts: [],
        deals: [],
        tasks: [],
        communications: [],
        products: [],
      };

      // Получаем расшифрованный токен
      const accessToken = this.connectionService.getDecryptedAccessToken(connection);

      // Получаем изменения только для запрошенных типов
      if (!entityTypes || entityTypes.includes("contacts")) {
        const contacts = await this.bitrix24Service.getContactsChangedSince(
          connection,
          accessToken,
          since
        );
        results.contacts = contacts.map((c) =>
          this.bitrix24Service.transformContact(c, connection.crmType)
        );
      }

      if (!entityTypes || entityTypes.includes("deals")) {
        const deals = await this.bitrix24Service.getDealsChangedSince(
          connection,
          accessToken,
          since
        );
        results.deals = deals.map((d) =>
          this.bitrix24Service.transformDeal(d, connection.crmType)
        );
      }

      if (!entityTypes || entityTypes.includes("tasks")) {
        const tasks = await this.bitrix24Service.getTasks(
          connection,
          accessToken,
          since
        );
        results.tasks = tasks.map((t) =>
          this.bitrix24Service.transformTask(t, connection.crmType)
        );
      }

      return results;
    }

    return {
      contacts: [],
      deals: [],
      tasks: [],
      communications: [],
      products: [],
    };
  }

  /**
   * Отправить изменение во внешнюю CRM
   */
  async sendChange(
    userId: string,
    change: {
      entityType: string;
      entityId: string;
      operation: string;
      payload: any;
    }
  ): Promise<void> {
    this.logger.log(
      `Sending change to external CRM: ${change.operation} ${change.entityType} for user ${userId}`
    );

    const connection = await this.connectionService.getActiveConnection(userId);

    if (!connection) {
      throw new NotFoundException(
        `No active CRM connection found for user ${userId}`
      );
    }

    const accessToken = this.connectionService.getDecryptedAccessToken(connection);

    if (connection.crmType === CrmType.AMOCRM) {
      if (change.entityType === "contact") {
        if (change.operation === "CREATE" || change.operation === "UPDATE") {
          await this.amoCrmService.createOrUpdateContact(
            connection,
            accessToken,
            change.payload
          );
        }
      } else if (change.entityType === "deal") {
        if (change.operation === "CREATE" || change.operation === "UPDATE") {
          await this.amoCrmService.createOrUpdateDeal(
            connection,
            accessToken,
            change.payload
          );
        }
      }
    } else if (connection.crmType === CrmType.BITRIX24) {
      if (change.entityType === "contact") {
        if (change.operation === "CREATE" || change.operation === "UPDATE") {
          await this.bitrix24Service.createOrUpdateContact(
            connection,
            accessToken,
            change.payload
          );
        }
      } else if (change.entityType === "deal") {
        if (change.operation === "CREATE" || change.operation === "UPDATE") {
          await this.bitrix24Service.createOrUpdateDeal(
            connection,
            accessToken,
            change.payload
          );
        }
      }
    }
  }

  /**
   * Проверка подключения к CRM
   */
  async testConnection(userId: string, crmType: string): Promise<boolean> {
    this.logger.log(`Testing connection to ${crmType} for user ${userId}`);

    try {
      const connection = await this.connectionService.getActiveConnection(
        userId,
        crmType as CrmType
      );

      if (!connection) {
        return false;
      }

      // Пробуем получить данные для проверки
      const accessToken = this.connectionService.getDecryptedAccessToken(connection);

      if (connection.crmType === CrmType.AMOCRM) {
        await this.amoCrmService.getContacts(connection, accessToken, 1, 1);
        return true;
      } else if (connection.crmType === CrmType.BITRIX24) {
        await this.bitrix24Service.getContacts(connection, accessToken);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Connection test failed for ${crmType}`, error);
      return false;
    }
  }
}

