CREATE TYPE "os_types" AS ENUM ('Windows', 'Linux', 'MacOS'); 

CREATE TABLE IF NOT EXISTS "developer_infos"(
	"id" BIGSERIAL PRIMARY KEY,
	"developer_since" DATE NOT NULL,
	"preferred_os" os_types NOT NULL
);

CREATE TABLE IF NOT EXISTS "developers"(
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) UNIQUE NOT NULL,
	"developer_infos_id" BIGINT UNIQUE,
	FOREIGN KEY ("developer_infos_id") REFERENCES "developer_infos"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "projects"(
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" VARCHAR(50) NOT NULL,
	"estimated_time" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"start_date" DATE NOT NULL,
	"end_date" DATE,
	"developer_id" BIGINT NOT NULL,
	FOREIGN KEY ("developer_id") REFERENCES "developers"("id") 
);

CREATE TABLE IF NOT EXISTS "technologies"(
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

INSERT INTO "technologies" ("name")
VALUES 	('Javascript'),
		('Python'),
		('React'),
		('Express.js'),
		('HTML'),
		('CSS'),
		('Django'),
		('PostgreSQL'),
		('MongoDB');
	
CREATE TABLE IF NOT EXISTS "projects_technologies"(
	"id" BIGSERIAL PRIMARY KEY,
	"projects_id" BIGINT NOT NULL,
	FOREIGN KEY ("projects_id") REFERENCES "projects"("id"),
	"technologies_id" BIGINT NOT NULL,
	FOREIGN KEY ("technologies_id") REFERENCES "technologies"("id"),
	"added_in" DATE NOT NULL
);
