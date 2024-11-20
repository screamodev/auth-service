CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	"fullname" varchar(100) NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
