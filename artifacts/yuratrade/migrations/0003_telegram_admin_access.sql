CREATE TABLE IF NOT EXISTS telegram_admin_access (
  telegram_user_id TEXT PRIMARY KEY
    CHECK (telegram_user_id ~ '^[0-9]{1,20}$'),
  pocket_option_id TEXT NOT NULL
    CHECK (pocket_option_id IN ('113510708', '92535291', '984367891')),
  locale TEXT CHECK (locale IN ('ru', 'uk', 'en')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
