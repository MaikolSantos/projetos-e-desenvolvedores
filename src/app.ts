import express, { Application, json } from "express";
import { startDatabase } from "./database";
import { developersLogic, projectsLogic } from "./logic";
import { developerExists, projectExists } from "./middlewares";
import "dotenv/config";

const app: Application = express();
app.use(json());

app.post("/developers", developersLogic.create);
app.post("/developers/:id/infos", developerExists, developersLogic.createInfos);
app.get("/developers", developersLogic.read);
app.get("/developers/:id", developerExists, developersLogic.readDeveloper);
app.get("/developers/:id/projects", developerExists, developersLogic.readProjectsDeveloper);
app.patch("/developers/:id", developerExists, developersLogic.update);
app.patch("/developers/:id/infos", developerExists, developersLogic.updateInfos);
app.delete("/developers/:id", developerExists, developersLogic.remove);

app.post("/projects", projectsLogic.create);
app.post("/projects/:id/technologies", projectExists, projectsLogic.createTechnology);
app.get("/projects", projectsLogic.read);
app.get("/projects/:id", projectExists, projectsLogic.readProjects);
app.patch("/projects/:id", projectExists, projectsLogic.update);
app.delete("/projects/:id", projectExists, projectsLogic.remove);
app.delete("/projects/:id/technologies/:name", projectExists, projectsLogic.removeTechnology);

const PORT = Number(process.env.SV_PORT) || 3000;
app.listen(PORT, async (): Promise<void> => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await startDatabase();
});
