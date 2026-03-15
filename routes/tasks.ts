import { Hono } from "hono";
import { listTasks, getTaskById } from "../models/tasks.js";

export const tasks = new Hono();

tasks.get("/", (c) => {
  const rows = listTasks(c.req.query());
  return c.json({ count: rows.length, tasks: rows });
});

tasks.get("/:id", (c) => {
  const task = getTaskById(c.req.param("id"));
  if (!task) return c.json({ error: "Not found" }, 404);
  return c.json({ task });
});
