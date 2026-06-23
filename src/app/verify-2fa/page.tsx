import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function Verify2faPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/book";
  redirect(`/login?verify=required&redirect=${encodeURIComponent(redirectTo)}`);
}
