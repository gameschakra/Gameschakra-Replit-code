-- Analytics tables migration
CREATE TABLE IF NOT EXISTS "analytics_daily" (
	"day" date PRIMARY KEY NOT NULL,
	"visits" bigint NOT NULL,
	"uniques" bigint NOT NULL,
	"game_starts" bigint NOT NULL,
	"avg_play_ms" bigint NOT NULL,
	"mobile_pct" numeric(5, 2) NOT NULL,
	"desktop_pct" numeric(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"ts" timestamp DEFAULT now() NOT NULL,
	"event_type" text NOT NULL CHECK ("event_type" IN ('page_view','play_start','play_end')),
	"visitor_id" text NOT NULL,
	"session_id" text NOT NULL,
	"path" text NOT NULL,
	"game_id" integer,
	"duration_ms" integer,
	"device" text NOT NULL,
	"referrer_host" text,
	"country" text
);

CREATE TABLE IF NOT EXISTS "game_play_daily" (
	"day" date NOT NULL,
	"game_id" integer NOT NULL,
	"starts" bigint NOT NULL,
	"avg_duration_ms" bigint NOT NULL,
	PRIMARY KEY ("day", "game_id")
);

CREATE INDEX IF NOT EXISTS "idx_ae_ts" ON "analytics_events"("ts");
CREATE INDEX IF NOT EXISTS "idx_ae_type_ts" ON "analytics_events"("event_type", "ts");
CREATE INDEX IF NOT EXISTS "idx_ae_game_ts" ON "analytics_events"("game_id", "ts");