import { QueryResult } from "pg";

interface IProjectsRequest {
  name: string;
  description: string;
  estimated_time: string;
  repository: string;
  start_date: Date;
  end_date?: Date;
  developer_id: number;
}

interface IProjects extends IProjectsRequest {
  projects_technologies_id: number
  id: number;
}

type ProjectsResult = QueryResult<IProjects>;

type ProjectKeys =
  | "name"
  | "description"
  | "estimated_time"
  | "repository"
  | "start_date"
  | "end_date"
  | "developer_id";

type TechnologiesKeys = "name";

type Technologies =
  | "Javascript"
  | "Python"
  | "React"
  | "Express.js"
  | "HTML"
  | "CSS"
  | "Django"
  | "PostgreSQL"
  | "MongoDB";

export {
  IProjectsRequest,
  IProjects,
  ProjectsResult,
  ProjectKeys,
  TechnologiesKeys,
  Technologies
};
