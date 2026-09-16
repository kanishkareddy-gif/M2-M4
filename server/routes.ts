import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginHandler, requireAuth } from "./auth";

function sendCreated(res: Response, payload: any) {
  return res.status(201).json(payload);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Health
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  // Auth
  app.post("/api/login", loginHandler);

  // Users
  app.post("/api/users", async (req: Request, res: Response) => {
    const body = req.body;
    const user = await storage.createUser(body);
    return sendCreated(res, user);
  });

  // Roles
  app.post("/api/roles", async (req: Request, res: Response) => {
    const { name } = req.body;
    const role = await storage.createRole(name);
    return sendCreated(res, role);
  });

  app.post(
    "/api/users/:userId/roles",
    async (req: Request, res: Response) => {
      const userId = req.params.userId;
      const { roleId } = req.body;
      await storage.assignRoleToUser(userId, roleId);
      return res.status(204).send(undefined);
    },
  );

  // Projects (protected)
  app.post("/api/projects", requireAuth, async (req: Request, res: Response) => {
    const project = await storage.createProject(req.body);
    return sendCreated(res, project);
  });

  app.get("/api/projects", requireAuth, async (_req: Request, res: Response) => {
    const list = await storage.listProjects();
    return res.json(list);
  });

  app.post(
    "/api/projects/:projectId/variants",
    requireAuth,
    async (req: Request, res: Response) => {
      const payload = { ...req.body, projectId: req.params.projectId };
      const v = await storage.createVariant(payload);
      return sendCreated(res, v);
    },
  );

  // Workflows
  app.get("/api/workflows", async (_req: Request, res: Response) => {
    const list = Array.from((storage as any).workflows?.values?.() ?? []);
    return res.json(list);
  });

  app.post("/api/workflows", requireAuth, async (req: Request, res: Response) => {
    const w = await storage.createWorkflow({
      ...req.body,
      stage: req.body.stage ?? "engineering",
      currentOwner: req.body.currentOwner ?? "VIE",
      metadata: req.body.metadata ?? { handoff: "Engineering -> PCL" },
    });
    return sendCreated(res, w);
  });

  app.get("/api/workflows/:id", async (req: Request, res: Response) => {
    const w = await storage.getWorkflow(req.params.id);
    if (!w) return res.status(404).json({ message: "not found" });
    return res.json(w);
  });

  app.patch("/api/workflows/:id/stage", async (req: Request, res: Response) => {
    const workflow = await storage.getWorkflow(req.params.id);
    if (!workflow) return res.status(404).json({ message: "not found" });

    const next = {
      ...workflow,
      stage: req.body.stage ?? workflow.stage ?? "engineering",
      currentOwner: req.body.currentOwner ?? workflow.currentOwner ?? "VIE",
      status: req.body.status ?? workflow.status,
      updatedAt: new Date().toISOString(),
    } as any;

    (storage as any).workflows.set(req.params.id, next);
    return res.json(next);
  });

  app.get("/api/workflows/:id/cost-summary", async (req: Request, res: Response) => {
    const workflow = await storage.getWorkflow(req.params.id);
    if (!workflow) return res.status(404).json({ message: "not found" });

    const bomItems = await storage.listBomItemsForWorkflow(req.params.id);
    const costs = await Promise.all(
      bomItems.map(async (item) => storage.addCost({ bomItemId: item.id, initialCost: 0, submittedCost: 0, rocCost: 0, sbcCost: 0, estCost: 0, costDelta: 0 }))
    );

    const summary = {
      workflowId: workflow.id,
      stage: workflow.stage ?? "engineering",
      currentOwner: workflow.currentOwner ?? "VIE",
      totalInitialCost: costs.reduce((sum, cost) => sum + (cost.initialCost ?? 0), 0),
      totalSubmittedCost: costs.reduce((sum, cost) => sum + (cost.submittedCost ?? 0), 0),
      totalRocmCost: costs.reduce((sum, cost) => sum + (cost.rocCost ?? 0), 0),
      totalSbcCost: costs.reduce((sum, cost) => sum + (cost.sbcCost ?? 0), 0),
      totalEstimationCost: costs.reduce((sum, cost) => sum + (cost.estCost ?? 0), 0),
    };

    return res.json(summary);
  });

  // Tasks
  app.post(
    "/api/workflows/:workflowId/tasks",
    requireAuth,
    async (req: Request, res: Response) => {
      const payload = { ...req.body, workflowId: req.params.workflowId };
      const t = await storage.createTask(payload);
      return sendCreated(res, t);
    },
  );

  app.get(
    "/api/tasks/user/:userId",
    async (req: Request, res: Response) => {
      const tasks = await storage.listTasksForUser(req.params.userId);
      return res.json(tasks);
    },
  );

  // BOM items
  app.post(
    "/api/workflows/:workflowId/bom",
    requireAuth,
    async (req: Request, res: Response) => {
      const payload = { ...req.body, workflowId: req.params.workflowId };
      const item = await storage.createBomItem(payload);
      return sendCreated(res, item);
    },
  );

  app.get(
    "/api/workflows/:workflowId/bom",
    async (req: Request, res: Response) => {
      const items = await storage.listBomItemsForWorkflow(
        req.params.workflowId,
      );
      return res.json(items);
    },
  );

  // Documents
  app.post(
    "/api/workflows/:workflowId/documents",
    requireAuth,
    async (req: Request, res: Response) => {
      const payload = {
        ...req.body,
        workflowId: req.params.workflowId,
      };
      const doc = await storage.uploadDocument(payload);
      return sendCreated(res, doc);
    },
  );

  // Costs
  app.post("/api/bom/:bomItemId/costs", requireAuth, async (req: Request, res: Response) => {
    const payload = { ...req.body, bomItemId: req.params.bomItemId };
    const c = await storage.addCost(payload);
    return sendCreated(res, c);
  });

  return httpServer;
}
