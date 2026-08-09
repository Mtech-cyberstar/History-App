-- The Battle screen is a visual stub. These rows choose its four topic cards;
-- there is deliberately no matchmaking or game data behind them.
insert into public.battle_topics (slug, name, image_path, position, published)
values
  ('rome',     E'Ancient\nRome',     'battle-rome.jpg',     1, true),
  ('britain',  'Britain',           'battle-britain.jpg',  2, true),
  ('colonial', E'Colonial\nAmerica','battle-colonial.jpg', 3, true),
  ('usa',      E'United\nStates',   'battle-usa.jpg',      4, true)
on conflict (slug) do nothing;
