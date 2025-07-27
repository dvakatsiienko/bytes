export interface NextPageProps {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
  params: Promise<{ id: string }>;
}
