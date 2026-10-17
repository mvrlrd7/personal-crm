"use client";

import { useEffect } from "react";

import { MessagePanel } from "@/components/message-panel";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MessagePanel
      title="Не удалось загрузить данные"
      description="Проверьте, что база данных запущена, и попробуйте ещё раз."
    >
      <Button onClick={() => retry()}>Попробовать ещё раз</Button>
    </MessagePanel>
  );
}
