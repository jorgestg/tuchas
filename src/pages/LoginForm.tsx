import { ApiError, PostgrestError, Session } from "@supabase/supabase-js";
import { Show } from "solid-js";
import { createStore } from "solid-js/store";

import { api } from "../api";
import { Button, FormField, Input } from "../components/FormControls";
import Logo from "../components/Logo";

interface Profile {
  id: string;
  display_name: string;
}

export default function LoginForm(props: {
  onLogin: (session: Session) => void;
}) {
  const [state, setState] = createStore({
    email: "",
    password: "",
    displayName: "",
    loading: false,
    signUpMode: false,
  });

  function toggleSignUpMode() {
    setState("signUpMode", (prev) => !prev);
  }

  function set<K extends keyof typeof state>(key: K, value: typeof state[K]) {
    setState(key, value);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    set("loading", true);

    try {
      let error: ApiError | PostgrestError | null, session: Session | null;

      // Sign up & create profile
      if (state.signUpMode) {
        const signUpResult = await api.auth.signUp({
          email: state.email,
          password: state.password,
        });

        if (signUpResult.error) {
          throw signUpResult.error;
        }

        const createProfileResult = await api.from<Profile>("profiles").insert({
          display_name: state.displayName,
        });

        session = signUpResult.session;
        error = createProfileResult.error;
      } else {
        // Sign in
        const result = await api.auth.signIn({
          email: state.email,
          password: state.password,
        });

        error = result.error;
        session = result.session;
      }

      if (!error) {
        props.onLogin(session as Session);
        return;
      }

      throw error;
    } finally {
      set("loading", false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      class="flex flex-col justify-center items-center gap-6 p-8 bg-white rounded-md h-[450px] w-[450px] shadow-lg"
    >
      <Show
        when={!state.loading}
        fallback={<h1 class="font-semibold text-3xl">Iniciando sesión...</h1>}
      >
        <Logo />

        {/* Display name */}
        <Show when={state.signUpMode}>
          <FormField class="w-full" label="Nombre">
            <Input
              class="w-full"
              type="text"
              required
              onChange={({ currentTarget }) =>
                set("displayName", currentTarget.value)
              }
            />
          </FormField>
        </Show>

        {/* Email */}
        <FormField class="w-full" label="Email">
          <Input
            type="email"
            class="w-full"
            required
            onChange={({ currentTarget }) => set("email", currentTarget.value)}
          />
        </FormField>

        {/* Password */}
        <FormField class="w-full" label="Contraseña">
          <Input
            class="w-full"
            type="password"
            required
            onChange={({ currentTarget }) =>
              set("password", currentTarget.value)
            }
          />
        </FormField>

        <div class="flex gap-2">
          {/* Sign in */}
          <Button type="submit" class="w-full">
            {state.signUpMode ? "Registrarse" : "Iniciar sesión"}
          </Button>
          {/* Sign up */}
          <Button
            type="button"
            class="w-full"
            outlined
            onClick={toggleSignUpMode}
          >
            {state.signUpMode ? "Iniciar sesión" : "Registrarse"}
          </Button>
        </div>
      </Show>
    </form>
  );
}
