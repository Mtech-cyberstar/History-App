-- Fills the paths tables, which were created empty in the first migration.
--
-- The design's two cards were a mock-up: "The Hundred Years' War" and "The
-- Tudor Dynasty", neither of which we have a single story about. A card that
-- opens an empty page is worse than one that is honest, so these are built
-- from the stories that actually exist. The purple and gold looks come from
-- `theme`, which maps to the design's .feudal and .tudors classes.
--
-- Safe to run more than once.

insert into paths (slug, pill, title, theme, position, published) values
  ('rise-of-the-ottomans', 'OTTOMAN FRONTIER',
   E'The Rise of\nthe Ottomans', 'feudal', 1, true),
  ('voices-of-anatolia',  'MEDIEVAL ANATOLIA',
   E'Voices of\nAnatolia',      'tudors', 2, true)
on conflict (slug) do nothing;

insert into path_stories (path_id, story_id, position)
select p.id, s.id, v.pos
from (values
  ('rise-of-the-ottomans', 'osman-ghazi',           1),
  ('rise-of-the-ottomans', 'mehmed-the-conqueror',  2),
  ('voices-of-anatolia',   'yunus-emre',            1)
) as v(path_slug, story_slug, pos)
join paths   p on p.slug = v.path_slug
join stories s on s.slug = v.story_slug
on conflict (path_id, story_id) do nothing;
