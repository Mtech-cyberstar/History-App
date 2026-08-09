export default function ProfileStats({
  chaptersDone,
  storiesStarted,
  storiesDone,
}: {
  chaptersDone: number;
  storiesStarted: number;
  storiesDone: number;
}) {
  const stats = [
    { value: chaptersDone, firstLine: "chapters", secondLine: "done" },
    { value: storiesStarted, firstLine: "stories", secondLine: "started" },
    { value: storiesDone, firstLine: "stories", secondLine: "done" },
  ];

  return (
    <div className="profile-stats" aria-label="Learning progress">
      {stats.map((stat, index) => (
        <div className="profile-stat" key={`${stat.firstLine}-${stat.secondLine}`}>
          {index > 0 && <span className="stat-divider" aria-hidden="true" />}
          <strong>{stat.value}</strong>
          <span>
            {stat.firstLine}
            <br />
            {stat.secondLine}
          </span>
        </div>
      ))}
    </div>
  );
}
