import { Hono } from "hono";
import { getRates } from "../models/rates.js";

export const rates = new Hono();

rates.get("/", (c) => {
  return c.json(getRates());
});
