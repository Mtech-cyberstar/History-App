import { createClient } from "@/lib/supabase/server";

export type BattleTopic = {
  slug: string;
  name: string;
  imagePath: string;
};

export async function getBattleTopics(): Promise<BattleTopic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("battle_topics")
    .select("slug, name, image_path")
    .order("position", { ascending: true });

  if (error) throw new Error(`Could not load battle topics: ${error.message}`);

  return (data ?? []).map((topic) => ({
    slug: topic.slug,
    name: topic.name,
    imagePath: topic.image_path ?? `battle-${topic.slug}.jpg`,
  }));
}
