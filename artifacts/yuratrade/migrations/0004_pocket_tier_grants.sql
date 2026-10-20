CREATE TABLE IF NOT EXISTS pocket_tier_grants (
  pocket_option_id TEXT PRIMARY KEY
    CHECK (pocket_option_id ~ '^[0-9]{9}$'),
  tier_id TEXT NOT NULL
    CHECK (tier_id IN ('iskra', 'vector', 'apex', 'none')),
  granted_by_telegram_id TEXT NOT NULL
    CHECK (granted_by_telegram_id ~ '^[0-9]{1,20}$'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
