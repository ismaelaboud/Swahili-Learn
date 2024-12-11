export interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}
