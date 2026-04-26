import { LearnedDetailPanel } from "@/modules/memory-center/LearnedDetailPanel";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Memory — Learned #${id}` };
}

export default async function LearnedDetailPage({ params }: Props) {
  const { id } = await params;
  return <LearnedDetailPanel id={id} />;
}
