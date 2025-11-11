import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { CrmConnection } from "../entities/crm-connection.entity";

interface AmoCRMContact {
  id: number;
  name: string;
  responsible_user_id: number;
  created_by: number;
  created_at: number;
  updated_at: number;
  custom_fields_values?: Array<{
    field_id: number;
    field_name: string;
    values: Array<{ value: string | number }>;
  }>;
}

interface AmoCRMDeal {
  id: number;
  name: string;
  price: number;
  responsible_user_id: number;
  status_id: number;
  pipeline_id: number;
  created_by: number;
  created_at: number;
  updated_at: number;
  contacts?: { id: number }[];
  custom_fields_values?: Array<{
    field_id: number;
    field_name: string;
    values: Array<{ value: string | number }>;
  }>;
}

interface AmoCRMTask {
  id: number;
  responsible_user_id: number;
  entity_id: number;
  entity_type: string;
  text: string;
  complete_till: number;
  created_at: number;
  updated_at: number;
  is_completed: boolean;
}

@Injectable()
export class AmoCrmService {
  private readonly baseUrl = "https://api.amocrm.ru";

  constructor(private readonly logger: LoggerService) {}

  /**
   * Получить OAuth URL для авторизации
   */
  getAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state: this.generateState(),
    });

    return `https://www.amocrm.ru/oauth?${params.toString()}`;
  }

  /**
   * Обменять код авторизации на токены
   */
  async exchangeCodeForTokens(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/access_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.description || "Failed to exchange code for tokens",
          HttpStatus.BAD_REQUEST
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error("AmoCRM token exchange error", error);
      throw error;
    }
  }

  /**
   * Обновить токен доступа
   */
  async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/access_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.description || "Failed to refresh token",
          HttpStatus.BAD_REQUEST
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error("AmoCRM token refresh error", error);
      throw error;
    }
  }

  /**
   * Получить все контакты
   */
  async getContacts(
    connection: CrmConnection,
    accessToken: string,
    page: number = 1,
    limit: number = 250
  ): Promise<AmoCRMContact[]> {
    const allContacts: AmoCRMContact[] = [];
    let currentPage = page;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/v4/contacts?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new HttpException(
            `Failed to fetch contacts: ${response.statusText}`,
            response.status
          );
        }

        const data = await response.json();
        allContacts.push(...data._embedded?.contacts || []);

        hasMore = data._embedded?.contacts?.length === limit;
        currentPage++;
      } catch (error) {
        this.logger.error("AmoCRM getContacts error", error);
        throw error;
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
  ): Promise<AmoCRMContact[]> {
    const sinceTimestamp = Math.floor(since.getTime() / 1000);

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v4/contacts?filter[updated_at][from]=${sinceTimestamp}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          `Failed to fetch changed contacts: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data._embedded?.contacts || [];
    } catch (error) {
      this.logger.error("AmoCRM getContactsChangedSince error", error);
      throw error;
    }
  }

  /**
   * Получить все сделки
   */
  async getDeals(
    connection: CrmConnection,
    accessToken: string,
    page: number = 1,
    limit: number = 250
  ): Promise<AmoCRMDeal[]> {
    const allDeals: AmoCRMDeal[] = [];
    let currentPage = page;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/v4/leads?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new HttpException(
            `Failed to fetch deals: ${response.statusText}`,
            response.status
          );
        }

        const data = await response.json();
        allDeals.push(...data._embedded?.leads || []);

        hasMore = data._embedded?.leads?.length === limit;
        currentPage++;
      } catch (error) {
        this.logger.error("AmoCRM getDeals error", error);
        throw error;
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
  ): Promise<AmoCRMDeal[]> {
    const sinceTimestamp = Math.floor(since.getTime() / 1000);

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v4/leads?filter[updated_at][from]=${sinceTimestamp}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          `Failed to fetch changed deals: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data._embedded?.leads || [];
    } catch (error) {
      this.logger.error("AmoCRM getDealsChangedSince error", error);
      throw error;
    }
  }

  /**
   * Получить задачи
   */
  async getTasks(
    connection: CrmConnection,
    accessToken: string,
    since?: Date
  ): Promise<AmoCRMTask[]> {
    const params = new URLSearchParams();

    if (since) {
      params.append("filter[updated_at][from]", Math.floor(since.getTime() / 1000).toString());
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/v4/tasks?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          `Failed to fetch tasks: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data._embedded?.tasks || [];
    } catch (error) {
      this.logger.error("AmoCRM getTasks error", error);
      throw error;
    }
  }

  /**
   * Создать/обновить контакт
   */
  async createOrUpdateContact(
    connection: CrmConnection,
    accessToken: string,
    contactData: any
  ): Promise<AmoCRMContact> {

    try {
      const response = await fetch(`${this.baseUrl}/api/v4/contacts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([contactData]),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.detail || "Failed to create/update contact",
          response.status
        );
      }

      const data = await response.json();
      return data._embedded?.contacts?.[0];
    } catch (error) {
      this.logger.error("AmoCRM createOrUpdateContact error", error);
      throw error;
    }
  }

  /**
   * Создать/обновить сделку
   */
  async createOrUpdateDeal(
    connection: CrmConnection,
    accessToken: string,
    dealData: any
  ): Promise<AmoCRMDeal> {

    try {
      const response = await fetch(`${this.baseUrl}/api/v4/leads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([dealData]),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.detail || "Failed to create/update deal",
          response.status
        );
      }

      const data = await response.json();
      return data._embedded?.leads?.[0];
    } catch (error) {
      this.logger.error("AmoCRM createOrUpdateDeal error", error);
      throw error;
    }
  }

  /**
   * Преобразовать AmoCRM контакт в нашу модель
   */
  transformContact(amoContact: AmoCRMContact, crmType: string): Partial<any> {
    const phoneField = amoContact.custom_fields_values?.find(
      (f) => f.field_name === "Телефон" || f.field_id === 123456 // Пример ID
    );
    const emailField = amoContact.custom_fields_values?.find(
      (f) => f.field_name === "Email" || f.field_id === 123457 // Пример ID
    );

    return {
      crmId: amoContact.id.toString(),
      crmType,
      name: amoContact.name,
      phone: phoneField?.values?.[0]?.value?.toString(),
      email: emailField?.values?.[0]?.value?.toString(),
      status: "active",
    };
  }

  /**
   * Преобразовать AmoCRM сделку в нашу модель
   */
  transformDeal(amoDeal: AmoCRMDeal, crmType: string): Partial<any> {
    return {
      crmId: amoDeal.id.toString(),
      crmType,
      title: amoDeal.name,
      amount: amoDeal.price || 0,
      stage: `stage_${amoDeal.status_id}`,
      contactId: amoDeal.contacts?.[0]?.id?.toString(),
    };
  }

  /**
   * Преобразовать AmoCRM задачу в нашу модель
   */
  transformTask(amoTask: AmoCRMTask, crmType: string): Partial<any> {
    return {
      crmId: amoTask.id.toString(),
      crmType,
      title: amoTask.text,
      status: amoTask.is_completed ? "completed" : "pending",
      relatedEntityId: amoTask.entity_id?.toString(),
      relatedEntityType: amoTask.entity_type,
      dueDate: amoTask.complete_till
        ? new Date(amoTask.complete_till * 1000)
        : null,
    };
  }

  /**
   * Убедиться, что токен валиден, обновить если нужно
   * Примечание: Этот метод должен быть вызван через CrmConnectionService
   */
  getAccessToken(connection: CrmConnection): string {
    // Токен должен быть расшифрован перед использованием
    // Это делается в CrmConnectionService
    return connection.accessToken;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

