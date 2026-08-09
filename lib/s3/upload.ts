import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const portraitTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const audioTypes = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
]);

export function validateUpload(path: string, contentType: string): string | null {
  if (!/^(portraits|lessons)\/[a-z0-9][a-z0-9._-]{0,127}$/.test(path)) {
    return "Use a safe path such as portraits/yunus-emre.png or lessons/yunus-emre-1.mp3.";
  }

  if (path.startsWith("portraits/") && !portraitTypes.has(contentType)) {
    return "Portraits must be JPEG, PNG, or WebP images.";
  }

  if (path.startsWith("lessons/") && !audioTypes.has(contentType)) {
    return "Lessons must be a supported audio file.";
  }

  return null;
}

export async function createPresignedUpload(path: string, contentType: string) {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("AWS upload configuration is incomplete");
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: path,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: 300 });
}
