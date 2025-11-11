import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact } from "./entities/contact.entity";
import { Deal } from "./entities/deal.entity";
import { Task } from "./entities/task.entity";
import { Communication } from "./entities/communication.entity";
import { Product } from "./entities/product.entity";

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  // Contacts
  async findAllContacts(userId?: string): Promise<Contact[]> {
    return this.contactRepository.find({
      order: { updatedAt: "DESC" },
    });
  }

  async findContactById(id: string): Promise<Contact> {
    return this.contactRepository.findOne({ where: { id } });
  }

  async findContactByCrmId(crmId: string, crmType: string): Promise<Contact> {
    return this.contactRepository.findOne({
      where: { crmId, crmType },
    });
  }

  async createContact(contactData: Partial<Contact>): Promise<Contact> {
    const contact = this.contactRepository.create(contactData);
    return this.contactRepository.save(contact);
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const contact = await this.findContactById(id);
    if (!contact) {
      throw new Error("Contact not found");
    }
    Object.assign(contact, updates);
    contact.syncVersion = contact.syncVersion + 1;
    return this.contactRepository.save(contact);
  }

  // Deals
  async findAllDeals(userId?: string): Promise<Deal[]> {
    return this.dealRepository.find({
      relations: ["contact"],
      order: { updatedAt: "DESC" },
    });
  }

  async findDealById(id: string): Promise<Deal> {
    return this.dealRepository.findOne({
      where: { id },
      relations: ["contact"],
    });
  }

  async createDeal(dealData: Partial<Deal>): Promise<Deal> {
    const deal = this.dealRepository.create(dealData);
    return this.dealRepository.save(deal);
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    const deal = await this.findDealById(id);
    if (!deal) {
      throw new Error("Deal not found");
    }
    Object.assign(deal, updates);
    deal.syncVersion = deal.syncVersion + 1;
    return this.dealRepository.save(deal);
  }

  // Tasks
  async findAllTasks(userId?: string): Promise<Task[]> {
    return this.taskRepository.find({
      order: { dueDate: "ASC" },
    });
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const task = this.taskRepository.create(taskData);
    return this.taskRepository.save(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new Error("Task not found");
    }
    Object.assign(task, updates);
    task.syncVersion = task.syncVersion + 1;
    return this.taskRepository.save(task);
  }

  // Products
  async findAllProducts(): Promise<Product[]> {
    return this.productRepository.find({
      order: { name: "ASC" },
    });
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error("Product not found");
    }
    Object.assign(product, updates);
    product.syncVersion = product.syncVersion + 1;
    return this.productRepository.save(product);
  }
}

