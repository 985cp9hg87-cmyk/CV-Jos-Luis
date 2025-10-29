import { promises as fs } from "fs";
import path from "path";
import TrackClient from "@/components/TrackClient";

export const revalidate = 0;

export default async function Page(){
  const filePath = path.join(process.cwd(), "public", "static", "content.html");
  let html = "<main style='padding:20px'>Falta public/static/content.html</main>";
  try{ html = await fs.readFile(filePath, "utf8"); }catch{}
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <TrackClient />
      <script src="/assets/user-behavior.js"></script>
    </>
  );
}