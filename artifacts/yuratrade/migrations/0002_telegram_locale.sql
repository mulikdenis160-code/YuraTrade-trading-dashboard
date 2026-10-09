ALTER TABLE telegram_pocket_bindings
  ADD COLUMN locale TEXT
    CHECK (locale IN ('ru', 'uk', 'en'));
