import { UserRoundXIcon } from "lucide-react";
import Link from "next/link";

import { MessagePanel } from "@/components/message-panel";
import { Button } from "@/components/ui/button";

export default function ContactNotFound() {
  return (
    <MessagePanel
      icon={UserRoundXIcon}
      title="Контакт не найден"
      description="Возможно, ссылка устарела или в адресе опечатка."
    >
      <Button asChild>
        <Link href="/">К списку контактов</Link>
      </Button>
    </MessagePanel>
  );
}
