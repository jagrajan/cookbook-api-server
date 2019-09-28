BEGIN;

  -- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  -- CREATE EXTENSION IF NOT EXISTS "unaccent";

  CREATE SCHEMA IF NOT EXISTS users;
  CREATE SCHEMA IF NOT EXISTS admin;
  CREATE SCHEMA IF NOT EXISTS cookbook;

  DROP TABLE IF EXISTS cookbook.measured_ingredient;
  DROP TABLE IF EXISTS cookbook.recipe_note;
  DROP TABLE IF EXISTS cookbook.recipe_step;
  DROP TABLE IF EXISTS cookbook.recipe_version;
  DROP TABLE IF EXISTS cookbook.ingredient;
  DROP TABLE IF EXISTS cookbook.recipe_category;
  DROP TABLE IF EXISTS cookbook.ingredient_category;
  DROP TABLE IF EXISTS cookbook.unit;
  DROP TABLE IF EXISTS cookbook.recipe;
  DROP TABLE IF EXISTS admin.admin;
  DROP TABLE IF EXISTS users.auth_key;
  DROP TABLE IF EXISTS users.profile;

  CREATE OR REPLACE FUNCTION update_last_update() RETURNS TRIGGER
  LANGUAGE plpgsql
  AS
  $$
  BEGIN
    NEW.last_update = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$;

  CREATE TABLE users.profile (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    email       TEXT                                        NOT NULL,
    password    TEXT                                        NOT NULL,
    name        TEXT
  );

  CREATE TABLE users.auth_key (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id     UUID                                        NOT NULL REFERENCES users.profile(id),
    expire_on   TIMESTAMP WITHOUT TIME ZONE                 NOT NULL,
    admin       BOOLEAN DEFAULT false
  );

  CREATE TABLE admin.admin (
    user_id     UUID PRIMARY KEY                            NOT NULL REFERENCES users.profile(id),
    expire_on   TIMESTAMP WITHOUT TIME ZONE,
    master      BOOLEAN DEFAULT false
  );

  CREATE TABLE cookbook.unit (
    id      SERIAL PRIMARY KEY  NOT NULL,
    name    TEXT,
    plural  TEXT
  );

  CREATE TABLE cookbook.ingredient_category (
    id    SERIAL PRIMARY KEY  NOT NULL,
    name  TEXT                NOT NULL
  );

  CREATE TABLE cookbook.ingredient (
    id        SERIAL PRIMARY KEY  NOT NULL,
    name      TEXT                NOT NULL,
    plural    TEXT,
    unit      INTEGER             REFERENCES cookbook.unit(id),
    category  INTEGER             REFERENCES cookbook.ingredient_category(id)
  );

  CREATE TABLE cookbook.recipe (
    id                SERIAL PRIMARY KEY  NOT NULL,
    released_version  INTEGER DEFAULT 0,
    latest_version    INTEGER DEFAULT 1,
    hidden            BOOLEAN DEFAULT false,
    slug              TEXT
  );

  CREATE TABLE cookbook.recipe_version (
    id                    SERIAL PRIMARY KEY,
    name                  TEXT                NOT NULL,
    description           TEXT,
    introduction          TEXT,
    compiled_introduction TEXT,
    image_file            TEXT,
    cook_time             TEXT,
    prep_time             TEXT,
    serves                INTEGER,
    recipe_id             INTEGER             NOT NULL REFERENCES cookbook.recipe(id),
    version               INTEGER             NOT NULL
  );

  CREATE TABLE cookbook.recipe_category (
    id    SERIAL PRIMARY KEY  NOT NULL,
    name  TEXT                NOT NULL
  );

  CREATE TABLE cookbook.recipe_step (
    id                    SERIAL PRIMARY KEY,
    recipe_version_id     INTEGER             NOT NULL REFERENCES cookbook.recipe_version(id),
    position              INTEGER             NOT NULL,
    description           TEXT
  );

  CREATE TABLE cookbook.measured_ingredient (
    id                  SERIAL PRIMARY KEY,
    min_amount          TEXT,
    max_amount          TEXT,
    position            INTEGER,
    ingredient_id       INTEGER               REFERENCES cookbook.ingredient(id),
    recipe_version_id   INTEGER               REFERENCES cookbook.recipe_version(id),
    unit_id             INTEGER               REFERENCES cookbook.unit(id)
  );

  CREATE TABLE cookbook.recipe_note (
    id                SERIAL PRIMARY KEY,
    position          INTEGER,
    recipe_id         INTEGER,
    recipe_version_id INTEGER,
    user_id           INTEGER,
    global            BOOLEAN,
    text              TEXT
  );

  DO $$
    DECLARE
      t record;
    BEGIN
      FOR t IN
        SELECT * FROM pg_tables
        WHERE schemaname IN ('admin', 'users', 'cookbook')
      LOOP
        EXECUTE format('ALTER TABLE %I.%I ' ||
          'ADD COLUMN create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();',
          t.schemaname, t.tablename);

        EXECUTE format('ALTER TABLE %I.%I ' ||
          'ADD COLUMN last_update TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();',
          t.schemaname, t.tablename);

        EXECUTE format('CREATE TRIGGER update_last_update
                        BEFORE UPDATE ON %I.%I
                        FOR EACH ROW EXECUTE PROCEDURE update_last_update()',
                        t.schemaname, t.tablename);
      END LOOP;
    END;
  $$ LANGUAGE plpgsql;

COMMIT;
