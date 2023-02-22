import { Request, Response } from "express";
import { filterData } from "./validations";
import format from "pg-format";
import {
  IProjectsRequest,
  Technologies,
  ProjectsResult,
  ProjectKeys,
  TechnologiesKeys,
} from "../interfaces/projects.interfaces";
import { client } from "../database";
import { QueryConfig } from "pg";

const create = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const keys: ProjectKeys[] = [
      "name",
      "description",
      "estimated_time",
      "repository",
      "start_date",
      "end_date",
      "developer_id",
    ];
    const body = filterData(request.body, keys);
    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);

    const queryString = `
      INSERT INTO projects (%I) VALUES (%L) RETURNING *;
    `;

    const queryFormat = format(queryString, bodyKeys, bodyValues);

    const queryResult: ProjectsResult = await client.query(queryFormat);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("violates not-null constraint")) {
      return response.status(400).json({
        message:
          "Required keys: name, description, estimated_time, repository, start_date, end_date, developer_id.",
      });
    }

    if (error.message.includes("violates foreign key constraint")) {
      return response.status(404).json({
        message: "Developer not found.",
      });
    }

    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const createTechnology = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const keys: TechnologiesKeys[] = ["name"];
    const body = filterData(request.body, keys);
    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);
    const id = Number(request.params.id);
    const today = new Date().toLocaleDateString();

    const technologies: Technologies[] = [
      "CSS",
      "Django",
      "Express.js",
      "HTML",
      "Javascript",
      "MongoDB",
      "PostgreSQL",
      "Python",
      "React",
    ];

    if (!technologies.includes(body.name)) {
      return response.status(400).json({
        message:
          "Allowed values: CSS, Django, Express.js, HTML, Javascript, MongoDB, PostgreSQL, Python, React",
      });
    }

    let queryString = `
      SELECT * FROM technologies
      WHERE (%I) = (%L);
    `;

    const queryFormat = format(queryString, bodyKeys, bodyValues);

    let queryResult: ProjectsResult = await client.query(queryFormat);

    queryString = `
      INSERT INTO projects_technologies (projects_id, technologies_id, added_in)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    let queryConfig: QueryConfig = {
      text: queryString,
      values: [id, queryResult.rows[0].id, today],
    };

    queryResult = await client.query(queryConfig);

    queryString = `
      SELECT 
        t.id technology_id,
        t.name technology_name,
        p.id project_id,
        p.name project_name,
        p.description,
        p.estimated_time,
        p.repository,
        p.start_date,
        p.end_date
      FROM projects p
      LEFT JOIN 
        projects_technologies pt ON pt."projects_id" = p.id 
      LEFT JOIN 
        technologies t ON t.id = pt."technologies_id" 
      WHERE 
        p.id = $1;
    `;

    queryConfig = { text: queryString, values: [id] };

    queryResult = await client.query(queryConfig);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("violates foreign key constraint")) {
      return response.status(404).json({
        message: "Developer not found.",
      });
    }

    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const read = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const queryString = `
      SELECT
        p.id project_id,
        p.name project_name,
        p.description,
        p.estimated_time,
        p.repository,
        p.start_date,
        p.end_date,
        p.developer_id project_developer_id,
        t.id technology_id,
        t.name technology_name
      FROM
        projects p
      LEFT JOIN
        projects_technologies pt 
        ON pt.projects_id = p.id
      LEFT JOIN 
        technologies t
        ON t.id = pt.technologies_id;
    `;

    const queryResult = await client.query(queryString);

    return response.status(200).json(queryResult.rows);
  } catch (error: any) {
    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const readProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id = Number(request.params.id);

    const queryString = `
      SELECT
        p.id project_id,
        p.name project_name,
        p.description,
        p.estimated_time,
        p.repository,
        p.start_date,
        p.end_date,
        p.developer_id project_developer_id,
        t.id technology_id,
        t.name technology_name
      FROM
        projects p
      LEFT JOIN
        projects_technologies pt 
        ON pt.projects_id = p.id
      LEFT JOIN 
        technologies t
        ON t.id = pt.technologies_id
      WHERE p.id = $1;
    `;

    const queryConfig: QueryConfig = { text: queryString, values: [id] };

    const queryResult: ProjectsResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows);
  } catch (error: any) {
    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const update = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const keys: ProjectKeys[] = [
      "name",
      "description",
      "estimated_time",
      "repository",
      "start_date",
      "end_date",
      "developer_id",
    ];
    const body = filterData(request.body, keys);

    Object.keys(body).forEach((key) => {
      if (!body[key]) {
        delete body[key];
      }
    });

    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);
    const id = Number(request.params.id);

    const queryString = `
      UPDATE projects SET (%I) = ROW(%L)
      WHERE id = $1
      RETURNING *;
    `;

    const queryFormat = format(queryString, bodyKeys, bodyValues);

    const queryConfig: QueryConfig = { text: queryFormat, values: [id] };

    const queryResult: ProjectsResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("syntax error at or near")) {
      return response.status(400).json({
        message:
          "Required keys: name, description, estimated_time, repository, start_date, end_date, developer_id.",
      });
    }

    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const remove = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id = Number(request.params.id);

    const queryString = `
      DELETE FROM projects
      WHERE id = $1
    `;

    const queryConfig: QueryConfig = { text: queryString, values: [id] };

    await client.query(queryConfig);

    return response.status(204).send();
  } catch (error: any) {
    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const removeTechnology = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id = Number(request.params.id);
    const name = request.params.name;

    const technologies = [
      "CSS",
      "Django",
      "Express.js",
      "HTML",
      "Javascript",
      "MongoDB",
      "PostgreSQL",
      "Python",
      "React",
    ];

    if (!technologies.includes(name)) {
      return response.status(404).json({
        message: "Technology not supported",
        options: [
          "JavaScript",
          "Python",
          "React",
          "Express.js",
          "HTML",
          "CSS",
          "Django",
          "PostgreSQL",
          "MongoDB",
        ],
      });
    }

    let queryString = `
      SELECT 
        pt.id projects_technologies_id,
        t.id technology_id,
        t.name technology_name,
        p.id project_id,
        p.name project_name,
        p.description,
        p.estimated_time,
        p.repository,
        p.start_date,
        p.end_date
      FROM projects p
      LEFT JOIN 
        projects_technologies pt ON pt."projects_id" = p.id 
      LEFT JOIN 
        technologies t ON t.id = pt."technologies_id" 
      WHERE 
        t.name = $1;
    `;

    let queryConfig: QueryConfig = { text: queryString, values: [name] };

    let queryResult: ProjectsResult = await client.query(queryConfig);

    console.log(queryResult.rows[0])

    if (!queryResult.rows[0]) {
      return response.status(404).json({
        message: `Technology ${name} not found on this Project.`,
      });
    }

    queryString = `
      DELETE FROM projects_technologies
      WHERE id = $1;
    `

    queryConfig = { text: queryString, values: [queryResult.rows[0].projects_technologies_id] };

    await client.query(queryConfig);

    return response.status(204).send();
  } catch (error: any) {
    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

export default {
  create,
  read,
  readProjects,
  update,
  remove,
  createTechnology,
  removeTechnology,
};
