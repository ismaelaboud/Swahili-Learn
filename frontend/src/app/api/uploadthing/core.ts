import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCookie } from "@/lib/cookies";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const token = getCookie('token');
      if (!token) throw new Error("Unauthorized");
 
      return { token };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.token);
      console.log("File URL:", file.url);
 
      return { fileUrl: file.url };
    }),

  lessonVideo: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
    .middleware(async () => {
      const token = getCookie('token');
      if (!token) throw new Error("Unauthorized");
 
      return { token };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.token);
      console.log("File URL:", file.url);
 
      return { fileUrl: file.url };
    }),

  lessonAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(async () => {
      const token = getCookie('token');
      if (!token) throw new Error("Unauthorized");
 
      return { token };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.token);
      console.log("File URL:", file.url);
 
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
