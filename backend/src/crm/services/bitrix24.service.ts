import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { CrmConnection } from "../entities/crm-connection.entity";

interface Bitrix24Contact {
  ID: string;
  NAME: string;
  LAST_NAME?: string;
  PHONE?: Array<{ VALUE: string }>;
  EMAIL?: Array<{ VALUE: string }>;
  COMPANY_TITLE?: string;
  POST?: string;
  COMMENTS?: string;
  DATE_CREATE: string;
  DATE_MODIFY: string;
}

interface Bitrix24Deal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  OPPORTUNITY: number;
  CURRENCY_ID: string;
  CONTACT_ID?: string;
  COMMENTS?: string;
  DATE_CREATE: string;
  DATE_MODIFY: string;
}

interface Bitrix24Task {
  ID: string;
  TITLE: string;
  DESCRIPTION?: string;
  CREATED_BY: string;
  RESPONSIBLE_ID: string;
  DEADLINE?: string;
  STATUS: number;
  CREATED_DATE: string;
  CHANGED_DATE: string;
  UF_CRM_TASK?: string; // ID связанной сущности
}

@Injectable()
export class Bitrix24Service {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Получить OAuth URL для авторизации
   */
  getAuthUrl(clientId: string, redirectUri: string, domain: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state: this.generateState(),
    });

    return `https://${domain}/oauth/authorize/?${params.toString()}`;
  }

  /**
   * Обменять код авторизации на токены
   */
  async exchangeCodeForTokens(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
    domain: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const response = await fetch(`https://${domain}/oauth/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.error_description || "Failed to exchange code for tokens",
          HttpStatus.BAD_REQUEST
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error("Bitrix24 token exchange error", error);
      throw error;
    }
  }

  /**
   * Обновить токен доступа
   */
  async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
    domain: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const response = await fetch(`https://${domain}/oauth/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.error_description || "Failed to refresh token",
          HttpStatus.BAD_REQUEST
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error("Bitrix24 token refresh error", error);
      throw error;
    }
  }

  /**
   * Выполнить запрос к Bitrix24 REST API
   */
  private async apiRequest(
    connection: CrmConnection,
    accessToken: string,
    method: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    const apiUrl = connection.apiUrl || "";
    const domain = apiUrl.replace("https://", "").replace("http://", "").split("/")[0];

    const url = `https://${domain}/rest/${method}?${new URLSearchParams({
      ...params,
      auth: accessToken,
    })}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `Bitrix24 API error: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      if (data.error) {
        throw new HttpException(data.error_description || data.error, HttpStatus.BAD_REQUEST);
      }

      return data.result || data;
    } catch (error) {
      this.logger.error(`Bitrix24 API request error: ${method}`, error);
      throw error;
    }
  }

  /**
   * Получить все контакты
   */
  async getContacts(
    connection: CrmConnection,
    accessToken: string
  ): Promise<Bitrix24Contact[]> {
    const allContacts: Bitrix24Contact[] = [];
    let start = 0;
    const limit = 50;

    while (true) {
      const result = await this.apiRequest(connection, accessToken, "crm.contact.list", {
        start,
        order: { DATE_MODIFY: "DESC" },
      });

      if (!result || result.length === 0) {
        break;
      }

      allContacts.push(...result);
      start += limit;

      if (result.length < limit) {
        break;
      }
    }

    return allContacts;
  }

  /**
   * Получить контакты, измененные с указанного времени
   */
  async getContactsChangedSince(
    connection: CrmConnection,
    accessToken: string,
    since: Date
  ): Promise<Bitrix24Contact[]> {
    const sinceTimestamp = Math.floor(since.getTime() / 1000);
    
    const result = await this.apiRequest(connection, accessToken, "crm.contact.list", {
      filter: { ">=DATE_MODIFY": new Date(sinceTimestamp * 1000).toISOString() },
      order: { DATE_MODIFY: "DESC" },
    });

    return result || [];
  }

  /**
   * Получить все сделки
   */
  async getDeals(
    connection: CrmConnection,
    accessToken: string
  ): Promise<Bitrix24Deal[]> {
    const allDeals: Bitrix24Deal[] = [];
    let start = 0;
    const limit = 50;

    while (true) {
      const result = await this.apiRequest(connection, accessToken, "crm.deal.list", {
        start,
        order: { DATE_MODIFY: "DESC" },
      });

      if (!result || result.length === 0) {
        break;
      }

      allDeals.push(...result);
      start += limit;

      if (result.length < limit) {
        break;
      }
    }

    return allDeals;
  }

  /**
   * Получить сделки, измененные с указанного времени
   */
  async getDealsChangedSince(
    connection: CrmConnection,
    accessToken: string,
    since: Date
  ): Promise<Bitrix24Deal[]> {
    const sinceTimestamp = Math.floor(since.getTime() / 1000);
    
    const result = await this.apiRequest(connection, accessToken, "crm.deal.list", {
      filter: { ">=DATE_MODIFY": new Date(sinceTimestamp * 1000).toISOString() },
      order: { DATE_MODIFY: "DESC" },
    });

    return result || [];
  }

  /**
   * Получить задачи
   */
  async getTasks(
    connection: CrmConnection,
    accessToken: string,
    since?: Date
  ): Promise<Bitrix24Task[]> {
    const params: any = {
      order: { CHANGED_DATE: "DESC" },
    };

    if (since) {
      params.filter = { ">=CHANGED_DATE": since.toISOString() };
    }

    const result = await this.apiRequest(connection, accessToken, "tasks.task.list", params);
    return result?.tasks || [];
  }

  /**
   * Создать/обновить контакт
   */
  async createOrUpdateContact(
    connection: CrmConnection,
    accessToken: string,
    contactData: any
  ): Promise<Bitrix24Contact> {
    const method = contactData.ID ? "crm.contact.update" : "crm.contact.add";
    const result = await this.apiRequest(connection, accessToken, method, {
      fields: contactData,
      id: contactData.ID,
    });

    return result;
  }

  /**
   * Создать/обновить сделку
   */
  async createOrUpdateDeal(
    connection: CrmConnection,
    accessToken: string,
    dealData: any
  ): Promise<Bitrix24Deal> {
    const method = dealData.ID ? "crm.deal.update" : "crm.deal.add";
    const result = await this.apiRequest(connection, accessToken, method, {
      fields: dealData,
      id: dealData.ID,
    });

    return result;
  }

  /**
   * Преобразовать Bitrix24 контакт в нашу модель
   */
  transformContact(bitrixContact: Bitrix24Contact, crmType: string): Partial<any> {
    return {
      crmId: bitrixContact.ID,
      crmType,
      name: `${bitrixContact.NAME} ${bitrixContact.LAST_NAME || ""}`.trim(),
      phone: bitrixContact.PHONE?.[0]?.VALUE,
      email: bitrixContact.EMAIL?.[0]?.VALUE,
      company: bitrixContact.COMPANY_TITLE,
      position: bitrixContact.POST,
      notes: bitrixContact.COMMENTS,
      status: "active",
    };
  }

  /**
   * Преобразовать Bitrix24 сделку в нашу модель
   */
  transformDeal(bitrixDeal: Bitrix24Deal, crmType: string): Partial<any> {
    return {
      crmId: bitrixDeal.ID,
      crmType,
      title: bitrixDeal.TITLE,
      amount: bitrixDeal.OPPORTUNITY || 0,
      currency: bitrixDeal.CURRENCY_ID || "RUB",
      stage: bitrixDeal.STAGE_ID,
      contactId: bitrixDeal.CONTACT_ID,
    };
  }

  /**
   * Преобразовать Bitrix24 задачу в нашу модель
   */
  transformTask(bitrixTask: Bitrix24Task, crmType: string): Partial<any> {
    return {
      crmId: bitrixTask.ID,
      crmType,
      title: bitrixTask.TITLE,
      description: bitrixTask.DESCRIPTION,
      status: bitrixTask.STATUS === 5 ? "completed" : "pending",
      assignedToUserId: bitrixTask.RESPONSIBLE_ID,
      relatedEntityId: bitrixTask.UF_CRM_TASK,
      dueDate: bitrixTask.DEADLINE ? new Date(bitrixTask.DEADLINE) : null,
    };
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

