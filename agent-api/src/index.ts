import express from "express";
import agentController from "./routes/agent-controller";
import authController from "./routes/auth-controller";
import userController from "./routes/user-controller";
import dotenv from "dotenv";
import { connectPrisma } from "./prisma";
import filesController from "./routes/files-controller";

dotenv.config();

const port = parseInt(process.env.PORT || "3005", 10);
if (!port) {
  throw new Error("PORT is missing");
}

const app = express();
app.disable("x-powered-by");

app.use(express.json());

app.use("/api/agents", agentController);
app.use("/api/auth", authController);
app.use("/api/user", userController);
app.use("/api/files", filesController);

app.use("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

connectPrisma();