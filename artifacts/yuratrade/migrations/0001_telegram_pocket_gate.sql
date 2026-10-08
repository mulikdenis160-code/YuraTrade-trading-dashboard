CREATE TABLE IF NOT EXISTS telegram_pocket_bindings (
  telegram_user_id TEXT PRIMARY KEY,
  pocket_option_id TEXT NOT NULL UNIQUE
    CHECK (pocket_option_id ~ '^[0-9]{9}$'),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telegram_pocket_gate_attempts (
  telegram_user_id TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0)
);
