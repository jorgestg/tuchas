import { ApiError, PostgrestError, Session } from "@supabase/supabase-js";
import { createSignal, Show } from "solid-js";

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
  const [loading, setLoading] = createSignal(false);
  const [signUpMode, setSignUpMode] = createSignal(false);
  const [error, setError] = createSignal("");

  function toggleSignUpMode() {
    setSignUpMode((prev) => !prev);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = new FormData(e.target as HTMLFormElement);
    const { email, password, displayName } = Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, value.toString()])
    );

    try {
      setLoading(true);
      let error: ApiError | PostgrestError | null, session: Session | null;

      // Sign up & create profile
      if (signUpMode()) {
        const signUpResult = await api.auth.signUp({ email, password });
        if (signUpResult.error) {
          setError(signUpResult.error.message);
          return;
        }

        const createProfileResult = await api.from<Profile>("profiles").insert({
          display_name: displayName,
        });

        session = signUpResult.session;
        error = createProfileResult.error;
      } else {
        // Sign in
        const result = await api.auth.signIn({ email, password });
        error = result.error;
        session = result.session;
      }

      if (!error) {
        props.onLogin(session as Session);
        return;
      }

      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      class="flex flex-col justify-between items-center p-8 bg-white rounded-md h-[480px] w-[95%] max-w-[450px] shadow-lg"
    >
      <Logo />

      <div class="flex flex-col w-full gap-4">
        {/* Display name */}
        <Show when={signUpMode()}>
          <FormField label="Nombre">
            <Input class="w-full" type="text" name="displayName" required />
          </FormField>
        </Show>

        {/* Email */}
        <FormField label="Email">
          <Input class="w-full" type="email" name="email" required />
        </FormField>

        {/* Password */}
        <FormField label="Contraseña">
          <Input class="w-full" type="password" name="password" required />
        </FormField>
      </div>

      <Show when={error()}>
        <span class="text-red-500 text-center">{error()}</span>
      </Show>

      <div class="flex gap-2">
        {/* Sign in */}
        <Button type="submit" disabled={loading()}>
          {signUpMode() ? "Registrarse" : "Iniciar sesión"}
        </Button>

        {/* Sign up */}
        <Button
          type="button"
          outlined
          disabled={loading()}
          onClick={toggleSignUpMode}
        >
          {signUpMode() ? "Iniciar sesión" : "Registrarse"}
        </Button>
      </div>
    </form>
  );
}
