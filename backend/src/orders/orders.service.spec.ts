import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { Order, OrderStatus } from "./entities/order.entity";
import { NotificationGateway } from "../notification/notification.gateway";
import { OrderHistoryService } from "./order-history.service";

describe("OrdersService", () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let notificationGateway: NotificationGateway;
  let orderHistoryService: OrderHistoryService;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockNotificationGateway = {
    emitOrderCreated: jest.fn(),
    emitOrderStatusChanged: jest.fn(),
  };

  const mockOrderHistoryService = {
    logOrderCreated: jest.fn(),
    logStatusChange: jest.fn(),
    logMasterAssignment: jest.fn(),
    logAmountChange: jest.fn(),
    logDescriptionChange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: NotificationGateway,
          useValue: mockNotificationGateway,
        },
        {
          provide: OrderHistoryService,
          useValue: mockOrderHistoryService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
    orderHistoryService = module.get<OrderHistoryService>(OrderHistoryService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new order", async () => {
      const createOrderDto = {
        clientId: "client-1",
        totalAmount: 5000,
        description: "Test order",
        status: "created" as OrderStatus,
      };

      const mockOrder: Partial<Order> = {
        id: "order-1",
        ...createOrderDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(result).toBeDefined();
      expect(result.id).toBe("order-1");
      expect(result.clientId).toBe("client-1");
      expect(mockNotificationGateway.emitOrderCreated).toHaveBeenCalled();
      expect(mockOrderHistoryService.logOrderCreated).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return an array of orders", async () => {
      const mockOrders: Partial<Order>[] = [
        {
          id: "order-1",
          clientId: "client-1",
          totalAmount: 5000,
          status: OrderStatus.CREATED,
        },
        {
          id: "order-2",
          clientId: "client-2",
          totalAmount: 3000,
          status: OrderStatus.COMPLETED,
        },
      ];

      mockOrderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("order-1");
    });
  });

  describe("findOne", () => {
    it("should return an order by id", async () => {
      const mockOrder: Partial<Order> = {
        id: "order-1",
        clientId: "client-1",
        totalAmount: 5000,
        status: OrderStatus.CREATED,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne("order-1");

      expect(result).toBeDefined();
      expect(result.id).toBe("order-1");
    });

    it("should throw NotFoundException when order does not exist", async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("should update order status", async () => {
      const existingOrder: Partial<Order> = {
        id: "order-1",
        clientId: "client-1",
        status: OrderStatus.CREATED,
        totalAmount: 5000,
      };

      const updateDto = {
        status: OrderStatus.IN_PROGRESS,
      };

      mockOrderRepository.findOne.mockResolvedValue(existingOrder);
      mockOrderRepository.save.mockResolvedValue({
        ...existingOrder,
        ...updateDto,
      });

      const result = await service.update("order-1", updateDto);

      expect(result.status).toBe(OrderStatus.IN_PROGRESS);
      expect(mockNotificationGateway.emitOrderStatusChanged).toHaveBeenCalled();
      expect(mockOrderHistoryService.logStatusChange).toHaveBeenCalled();
    });

    it("should throw NotFoundException when order does not exist", async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.update("non-existent", {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should remove order", async () => {
      const mockOrder: Partial<Order> = {
        id: "order-1",
        clientId: "client-1",
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.remove.mockResolvedValue(mockOrder);

      await service.remove("order-1");

      expect(mockOrderRepository.remove).toHaveBeenCalled();
    });
  });
});

