import { Router } from "express";
import { listCustomers, getCustomer } from "../controllers/customers.controller";

const router = Router();

router.get("/", listCustomers);
router.get("/:id", getCustomer);

export default router;
