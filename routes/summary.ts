import { Hono } from "hono";
import { getSummary } from "../models/summary.js";

export const summary = new Hono();

summary.get("/", (c) => {
  return c.json(getSummary());
});
