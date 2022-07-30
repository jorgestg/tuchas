import { Session } from "@supabase/supabase-js";
import { createSignal, Show } from "solid-js";

import LoginForm from "./pages/LoginForm";
import Chat from "./pages/Chat";

function App() {
  const [session, setSession] = createSignal<Session | null>(null);

  return (
    <main class="flex justify-center items-center h-screen bg-gradient-to-r from-amber-300 to-amber-700">
      <Show when={session()} fallback={<LoginForm onLogin={setSession} />}>
        <Chat session={session() as Session} />
      </Show>
    </main>
  );
}

export default App;
