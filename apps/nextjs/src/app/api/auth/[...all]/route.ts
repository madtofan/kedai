import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@kedai/api";

export const { POST, GET } = toNextJsHandler(auth);
