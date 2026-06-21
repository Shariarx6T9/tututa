import { ChatInterface } from "@/components/chat/ChatInterface";

type Props = { params: Promise<{ id: string }> };

export default async function ChatDetailPage({ params }: Props) {
  const { id } = await params;
  return <ChatInterface chatId={id} />;
}
