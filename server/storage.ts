import {
  type User,
  type InsertUser,
  type Project,
  type Variant,
  type Workflow,
  type Task,
  type BomItem,
  type Document,
  type Cost,
  type Role,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Roles
  createRole(name: string): Promise<Role>;
  assignRoleToUser(userId: string, roleId: number): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;
  // Projects & variants
  createProject(p: Partial<Project>): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  listProjects(): Promise<Project[]>;
  createVariant(v: Partial<Variant>): Promise<Variant>;
  // Workflows
  createWorkflow(w: Partial<Workflow>): Promise<Workflow>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  // Tasks
  createTask(t: Partial<Task>): Promise<Task>;
  listTasksForUser(userId: string): Promise<Task[]>;
  // BOM
  createBomItem(b: Partial<BomItem>): Promise<BomItem>;
  listBomItemsForWorkflow(workflowId: string): Promise<BomItem[]>;
  // Documents & costs
  uploadDocument(d: Partial<Document>): Promise<Document>;
  addCost(c: Partial<Cost>): Promise<Cost>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private variants: Map<string, Variant>;
  private workflows: Map<string, Workflow>;
  private tasks: Map<string, Task>;
  private bomItems: Map<string, BomItem>;
  private documents: Map<string, Document>;
  private costs: Map<string, Cost>;
  private roles: Map<number, Role>;
  private userRolesMap: Map<string, number[]>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.variants = new Map();
    this.workflows = new Map();
    this.tasks = new Map();
    this.bomItems = new Map();
    this.documents = new Map();
    this.costs = new Map();
    this.roles = new Map();
    this.userRolesMap = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createRole(name: string): Promise<Role> {
    const id = this.roles.size + 1;
    const role: Role = { id, name } as Role;
    this.roles.set(id, role);
    return role;
  }

  async assignRoleToUser(userId: string, roleId: number): Promise<void> {
    const list = this.userRolesMap.get(userId) ?? [];
    if (!list.includes(roleId)) list.push(roleId);
    this.userRolesMap.set(userId, list);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const ids = this.userRolesMap.get(userId) ?? [];
    return ids.map((id) => this.roles.get(id)).filter(Boolean) as Role[];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createProject(p: Partial<Project>): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      id,
      name: p.name ?? "",
      description: p.description ?? null,
      createdAt: p.createdAt ?? new Date().toISOString(),
    } as Project;
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createVariant(v: Partial<Variant>): Promise<Variant> {
    const id = randomUUID();
    const variant: Variant = {
      id,
      projectId: v.projectId ?? "",
      name: v.name ?? "",
      isBase: v.isBase ?? false,
      metadata: v.metadata ?? null,
      status: v.status ?? "initiated",
    } as Variant;
    this.variants.set(id, variant);
    return variant;
  }

  async createWorkflow(w: Partial<Workflow>): Promise<Workflow> {
    const id = randomUUID();
    const workflow: Workflow = {
      id,
      projectId: w.projectId ?? "",
      variantId: w.variantId ?? null,
      initiatorId: w.initiatorId ?? "",
      status: w.status ?? "initiated",
      createdAt: w.createdAt ?? new Date().toISOString(),
      updatedAt: w.updatedAt ?? new Date().toISOString(),
    } as Workflow;
    this.workflows.set(id, workflow);
    return workflow;
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createTask(t: Partial<Task>): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
      workflowId: t.workflowId ?? "",
      assignedTo: t.assignedTo ?? null,
      role: t.role ?? "SE",
      status: t.status ?? "assigned",
      payload: t.payload ?? null,
      createdAt: t.createdAt ?? new Date().toISOString(),
      updatedAt: t.updatedAt ?? new Date().toISOString(),
    } as Task;
    this.tasks.set(id, task);
    return task;
  }

  async listTasksForUser(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (t) => t.assignedTo === userId,
    );
  }

  async createBomItem(b: Partial<BomItem>): Promise<BomItem> {
    const id = randomUUID();
    const item: BomItem = {
      id,
      workflowId: b.workflowId ?? "",
      parentId: b.parentId ?? null,
      level: b.level ?? 1,
      partNumber: b.partNumber ?? "",
      description: b.description ?? null,
      changeType: b.changeType ?? null,
      quantity: b.quantity ?? null,
      unit: b.unit ?? null,
      remarks: b.remarks ?? null,
    } as BomItem;
    this.bomItems.set(id, item);
    return item;
  }

  async listBomItemsForWorkflow(workflowId: string): Promise<BomItem[]> {
    return Array.from(this.bomItems.values()).filter(
      (b) => b.workflowId === workflowId,
    );
  }

  async uploadDocument(d: Partial<Document>): Promise<Document> {
    const id = randomUUID();
    const doc: Document = {
      id,
      workflowId: d.workflowId ?? "",
      uploadedBy: d.uploadedBy ?? null,
      filename: d.filename ?? "",
      url: d.url ?? "",
      createdAt: d.createdAt ?? new Date().toISOString(),
    } as Document;
    this.documents.set(id, doc);
    return doc;
  }

  async addCost(c: Partial<Cost>): Promise<Cost> {
    const id = randomUUID();
    const cost: Cost = {
      id,
      bomItemId: c.bomItemId ?? "",
      initialCost: c.initialCost ?? null,
      submittedCost: c.submittedCost ?? null,
      rocCost: c.rocCost ?? null,
      sbcCost: c.sbcCost ?? null,
      estCost: c.estCost ?? null,
      remarks: c.remarks ?? null,
    } as Cost;
    this.costs.set(id, cost);
    return cost;
  }
}

export const storage = new MemStorage();
