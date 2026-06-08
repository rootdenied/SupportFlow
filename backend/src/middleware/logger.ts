import morgan from "morgan";
import { env } from "../config/env";

const format =
  env.NODE_ENV === "development"
    ? ":method :url :status :response-time ms - :res[content-length]"
    : "combined";

export const logger = morgan(format);
