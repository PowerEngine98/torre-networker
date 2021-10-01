--DROP SCHEMA IF EXISTS networker CASCADE;
CREATE SCHEMA IF NOT EXISTS networker;
ALTER USER postgres SET search_path = public, networker;
SET SCHEMA 'networker';

CREATE TABLE IF NOT EXISTS "user"  ( 
	"id"            SERIAL PRIMARY KEY,
	"username"		varchar NOT NULL UNIQUE,
	"name"          varchar NOT NULL,
	"weight"        numeric NOT NULL CHECK (weight >= 0),
	"headline"      varchar NOT NULL,
	"photo"         varchar
);

CREATE TABLE IF NOT EXISTS "organization"  (
	"id"            SERIAL PRIMARY KEY,
	"name"          varchar NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "user_organization"  (
	"user_id"	    integer NOT NULL REFERENCES "user" ON DELETE CASCADE ON UPDATE CASCADE, 
	"organization_id"	integer NOT NULL REFERENCES "organization" ON DELETE CASCADE ON UPDATE CASCADE
);