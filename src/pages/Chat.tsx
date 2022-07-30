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
    <div class="max-w-[1000px] w-[95%] bg-white h-[90%] flex flex-col rounded-md shadow-lg p-4">
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
        <Button
          type="submit"
          class="flex justify-center items-center text-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            width="1em"
            height="1em"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="M1.724 1.053a.5.5 0 0 0-.714.545l1.403 4.85a.5.5 0 0 0 .397.354l5.69.953c.268.053.268.437 0 .49l-5.69.953a.5.5 0 0 0-.397.354l-1.403 4.85a.5.5 0 0 0 .714.545l13-6.5a.5.5 0 0 0 0-.894l-13-6.5Z"
            />
          </svg>
          <span class="hidden sm:inline">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
