import client from "./config";

const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("Connected to the database");
};

export default startDatabase;
