import { Request, Response } from "express";
import { filterData } from "./validations";
import format from "pg-format";
import {
  DeveloperInfosKeys,
  DeveloperInfosResult,
  DeveloperKeys,
  DevelopersResult,
} from "../interfaces/developers.interfaces";
import { client } from "../database";
import { QueryConfig } from "pg";

const create = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const keys: DeveloperKeys[] = ["name", "email", "developer_infos_id"];
    const body = filterData(request.body, keys);
    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);

    const queryString = `
      INSERT INTO developers (%I) VALUES (%L) RETURNING *;
    `;

    const queryFormat = format(queryString, bodyKeys, bodyValues);

    const queryResult: DevelopersResult = await client.query(queryFormat);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("violates not-null constraint")) {
      return response
        .status(400)
        .json({ message: "Required keys: name and email." });
    }

    if (error.message.includes("violates unique constraint")) {
      return response.status(409).json({ message: "Email already exists." });
    }

    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const createInfos = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const keys: DeveloperInfosKeys[] = ["developer_since", "preferred_os"];
    const body = filterData(request.body, keys);
    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);
    const id = Number(request.params.id);

    let queryString = `
      INSERT INTO developer_infos (%I) VALUES (%L) RETURNING *;
    `;

    const queryFormat = format(queryString, bodyKeys, bodyValues);

    let queryResult: DeveloperInfosResult = await client.query(queryFormat);

    queryString = `
      UPDATE developers
      SET developer_infos_id = $1
      WHERE id = $2
      RETURNING *
    `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryResult.rows[0].id, id],
    };

    await client.query(queryConfig);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("violates not-null constraint")) {
      return response
        .status(400)
        .json({ message: "Required keys: developer_since and preferred_os" });
    }

    if (error.message.includes("invalid input value for enum os_types")) {
      return response.status(409).json({
        message: "Allowed values for preferred_os: Windows, Linux, MacOS",
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
      SELECT d.*, di.developer_since, di.preferred_os
      FROM developers d
      LEFT JOIN developer_infos di
      ON d.developer_infos_id = di.id;
    `;

    const queryResult = await client.query(queryString);

    return response.status(200).json(queryResult.rows);
  } catch (error: any) {
    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const readProjectsDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id = Number(request.params.id);

    const queryString = `
      SELECT 
        d."id" "developer_id" ,
        d."name" "developer_name",
        d."email" "developerEmail",
        d."developer_infos_id",
        di."developer_since",
        di."preferred_os",
        p."id" "project_id",
        p."name" "project_name",
        p."description",
        p."estimated_time",
        p."repository",
        p."start_date",
        p."end_date",
        t."id" "technology_id",
        t."name" "technology_name"
      FROM 
        developers d 
      LEFT JOIN
        developer_infos di
        ON d."developer_infos_id" = di.id 
      LEFT JOIN
        projects p
        ON p."developer_id" = d.id
      LEFT JOIN 
        projects_technologies pt
        ON pt."projects_id" = p.id 
      LEFT JOIN 
        technologies t
        ON t.id = pt."technologies_id" 
      WHERE 
        d.id = $1;
    `;

    const queryConfig: QueryConfig = { text: queryString, values: [id] };

    const queryResult: DevelopersResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows);
  } catch (error: any) {
    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const readDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id = Number(request.params.id);

    const queryString = `
      SELECT d.*, di.developer_since, di.preferred_os
      FROM developers d 
      LEFT JOIN developer_infos di
      ON d.developer_infos_id = di.id
      WHERE d.id = $1;
    `;

    const queryConfig: QueryConfig = { text: queryString, values: [id] };

    const queryResult: DevelopersResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
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
    const keys: DeveloperKeys[] = ["name", "email"];
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
      UPDATE developers SET (%I) = ROW(%L)
      WHERE id = $1
      RETURNING *;
    `;

    const queryFormat = format(queryString, bodyKeys, bodyValues);

    const queryConfig: QueryConfig = { text: queryFormat, values: [id] };

    const queryResult: DevelopersResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("syntax error at or near")) {
      return response
        .status(400)
        .json({ message: "Required keys: name or email." });
    }

    if (error.message.includes("violates unique constraint")) {
      return response.status(409).json({ message: "Email already exists." });
    }

    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

const updateInfos = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const keys: DeveloperInfosKeys[] = ["developer_since", "preferred_os"];
    const body = filterData(request.body, keys);

    console.log(body);

    Object.keys(body).forEach((key) => {
      if (!body[key]) {
        delete body[key];
      }
    });

    console.log(body);

    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);
    const id = Number(request.params.id);

    const queryString = `
      UPDATE developer_infos SET (%I) = ROW(%L)
      WHERE id = $1
      RETURNING *;
    `;

    const queryFormat = format(queryString, bodyKeys, bodyValues);

    const queryConfig: QueryConfig = { text: queryFormat, values: [id] };

    const queryResult: DevelopersResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("syntax error at or near")) {
      return response
        .status(400)
        .json({ message: "Required keys: developer_since or preferred_os." });
    }

    if (error.message.includes("invalid input value for enum os_types")) {
      return response.status(409).json({
        message: "Allowed values for preferred_os: Windows, Linux, MacOS",
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

    let queryString = `
      SELECT d.*, di.developer_since, di.preferred_os
      FROM developers d 
      LEFT JOIN developer_infos di
      ON d.developer_infos_id = di.id
      WHERE d.id = $1;
    `;

    let queryConfig: QueryConfig = { text: queryString, values: [id] };

    const queryResult: DevelopersResult = await client.query(queryConfig);

    if (queryResult.rows[0].developer_infos_id) {
      const queryString = `
        DELETE FROM developer_infos
        WHERE id = $1
      `;

      const queryConfig: QueryConfig = {
        text: queryString,
        values: [queryResult.rows[0].developer_infos_id],
      };

      await client.query(queryConfig);
    }

    queryString = `
        DELETE FROM developers
        WHERE id = $1
      `;

    queryConfig = {
      text: queryString,
      values: [id],
    };

    await client.query(queryConfig);

    return response.status(204).send();
  } catch (error: any) {
    console.log(error.message);

    return response.status(500).json({ message: error.message });
  }
};

export default {
  create,
  createInfos,
  read,
  readDeveloper,
  readProjectsDeveloper,
  update,
  updateInfos,
  remove,
};
