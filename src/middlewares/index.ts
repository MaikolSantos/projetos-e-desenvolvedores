import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { DevelopersResult } from "../interfaces/developers.interfaces";
import { client } from "../database";

const developerExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = Number(request.params.id);

  const queryString = `SELECT * FROM developers WHERE id = $1`;

  const queryConfig: QueryConfig = { text: queryString, values: [id] };

  const queryResult: DevelopersResult = await client.query(queryConfig);

  if (!queryResult.rows[0]) {
    return response.status(404).json({ message: "Developer not found." });
  }

  next();
};

const projectExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = Number(request.params.id);

  const queryString = `SELECT * FROM projects WHERE id = $1`;

  const queryConfig: QueryConfig = { text: queryString, values: [id] };

  const queryResult: DevelopersResult = await client.query(queryConfig);

  if (!queryResult.rows[0]) {
    return response.status(404).json({ message: "Project not found." });
  }

  next();
};

export { developerExists, projectExists };
