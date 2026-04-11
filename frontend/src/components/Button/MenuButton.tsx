// src/components/MenuButton.tsx
import { JSX, splitProps, Show } from "solid-js";
import { A } from "@solidjs/router"; // Usamos 'A' de SolidStart para navegación SPA ultra rápida
import "./button.scss";

// Definimos props separadas para mayor claridad
type CommonProps = {
  children: JSX.Element;
  class?: string;
};

type ButtonProps = CommonProps & JSX.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type AnchorProps = CommonProps & JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type MenuButtonProps = ButtonProps | AnchorProps;

// src/components/Button/MenuButton.tsx
export default function MenuButton(props: MenuButtonProps) {
  const [local, others] = splitProps(props, ["href", "children", "class", "type"]);

  const classList = () => `menu-button ${local.class || ""}`;

  return (
    <Show
      when={local.href}
      fallback={
        <button type={local.type as "button" | "submit" | "reset" | undefined} class={classList()} {...(others as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}>
          {local.children}
        </button>
      }
    >
      <A href={local.href!} class={classList()} {...(others as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {local.children}
      </A>
    </Show>
  );
}