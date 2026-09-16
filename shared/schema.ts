import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().default(sql`nextval('roles_id_seq')`),
  name: text("name").notNull().unique(),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roleId: integer("role_id").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const variants = pgTable("variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  isBase: boolean("is_base").notNull().default(false),
  metadata: jsonb("metadata"),
  status: text("status").notNull().default(sql`'initiated'`),
});

export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  variantId: varchar("variant_id"),
  initiatorId: varchar("initiator_id").notNull(),
  status: text("status").notNull().default(sql`'initiated'`),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  assignedTo: varchar("assigned_to"),
  role: text("role").notNull(),
  status: text("status").notNull().default(sql`'assigned'`),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const bomItems = pgTable("bom_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  parentId: varchar("parent_id"),
  level: integer("level").notNull().default(1),
  partNumber: text("part_number").notNull(),
  description: text("description"),
  changeType: text("change_type"),
  quantity: integer("quantity"),
  unit: text("unit"),
  remarks: text("remarks"),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  uploadedBy: varchar("uploaded_by"),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const costs = pgTable("costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomItemId: varchar("bom_item_id").notNull(),
  initialCost: integer("initial_cost"),
  submittedCost: integer("submitted_cost"),
  rocCost: integer("roc_cost"),
  sbcCost: integer("sbc_cost"),
  estCost: integer("est_cost"),
  remarks: text("remarks"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Role = typeof roles.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Workflow = typeof workflows.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type BomItem = typeof bomItems.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Cost = typeof costs.$inferSelect;
