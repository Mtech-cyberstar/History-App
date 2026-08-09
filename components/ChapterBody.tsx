import ReactMarkdown from "react-markdown";

export default function ChapterBody({ body }: { body: string }) {
  return (
    <div className="chapter-body">
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
}
