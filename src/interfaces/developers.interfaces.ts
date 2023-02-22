import { QueryResult } from "pg";

interface IDevelopersRequest {
  name: string;
  email: string;
  developer_infos_id?: number;
}

interface IDeveloperInfoRequest {
  developer_since: Date;
  preferred_os: string;
}

interface IDevelopers extends IDevelopersRequest {
  id: number;
}

interface IDeveloperInfo extends IDeveloperInfoRequest {
  id: number;
}

type DevelopersResult = QueryResult<IDevelopers>;

type DeveloperInfosResult = QueryResult<IDeveloperInfo>;

type DeveloperKeys = "name" | "email" | "developer_infos_id";

type DeveloperInfosKeys = "developer_since" | "preferred_os";

export {
  IDevelopersRequest,
  IDeveloperInfoRequest,
  IDevelopers,
  IDeveloperInfo,
  DevelopersResult,
  DeveloperInfosResult,
  DeveloperKeys,
  DeveloperInfosKeys,
};
