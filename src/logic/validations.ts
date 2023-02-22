import {
  DeveloperInfosKeys,
  DeveloperKeys,
} from "../interfaces/developers.interfaces";
import { ProjectKeys, TechnologiesKeys } from "../interfaces/projects.interfaces";

const filterData = (
  payload: any,
  keys: DeveloperInfosKeys[] | DeveloperKeys[] | ProjectKeys[] | TechnologiesKeys[]
) => {
  const filterKeysPayload = keys.map((key) => {
    return { [key]: payload[key] };
  });

  const newPayload = filterKeysPayload.reduce((previous, current) => {
    return {
      ...previous,
      ...current,
    };
  }, {});

  return newPayload;
};

export { filterData };
