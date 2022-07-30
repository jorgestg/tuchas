import { RealtimeSubscription, Session } from "@supabase/supabase-js";
import { createResource, For, onCleanup, onMount, Show } from "solid-js";
import { api } from "../api";

import { Input, Button } from "../components/FormControls";
import Logo from "../components/Logo";

interface Message {
  id: string;
  created_at: string;
  message: string;
  profile: { display_name: string };
}

type CreateMessage = Omit<Message, "profile"> & { profile_id: string };

function ChatBubble(props: { message: Message }) {
  function formattedDate() {
    const date = new Date(props.message.created_at);
    return `${date.getHours()}:${date.getMinutes()}`;
  }

  return (
    <div class="flex flex-col p-4 mb-3 border-t border-t-gray-300">
      <span class="font-medium">{props.message.profile.display_name}</span>
      {props.message.message}
      <small class="text-right text-gray-800">{formattedDate()}</small>
    </div>
  );
}

function ChatView(props: { messages: Message[] }) {
  return (
    <div class="flex-1 overflow-y-scroll my-4">
      <Show
        when={props.messages.length}
        fallback={<span>No hay mucho que ver por aquí...</span>}
      >
        <For each={props.messages}>
          {(message) => <ChatBubble message={message} />}
        </For>
      </Show>
    </div>
  );
}

export default function Chat(props: { session: Session }) {
  const [messages, { refetch }] = createResource(async () => {
    return await api
      .from<Message>("messages")
      .select("id, created_at, message, profile:profiles(display_name)")
      .limit(50);
  });

  async function sendMessage(e: SubmitEvent) {
    e.preventDefault();

    const form = new FormData(e.target as HTMLFormElement);
    const message = form.get("message") as string;
    await api.from<CreateMessage>("messages").insert({
      message,
      profile_id: props.session.user!.id,
    });
  }

  let subscription: RealtimeSubscription;
  onMount(() => {
    subscription = api
      .from<Message>("messages")
      .on("INSERT", refetch)
      .subscribe();
  });

  onCleanup(() => {
    subscription && api.removeSubscription(subscription);
  });

  return (
    <div class="max-w-[1000px] w-[90%] bg-white h-[90%] flex flex-col rounded-md shadow-lg p-4">
      <div class="w-full flex justify-end">
        <Logo />
      </div>

      <ChatView messages={messages.latest?.body || []} />

      <form class="flex w-full gap-2" onSubmit={sendMessage}>
        <Input
          class="w-full"
          placeholder="Escribe tu mensaje"
          name="message"
          required
        />
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  );
}
