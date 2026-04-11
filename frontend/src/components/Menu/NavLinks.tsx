import { For } from "solid-js";
import { A } from "@solidjs/router";
import { navLinks } from "~/data/navigation";

export default function NavLinks(props: { onClick?: () => void, class?: string }) {
  return (
    <For each={navLinks}>
      {(link) => (
        <A 
          href={link.href} 
          class={props.class} 
          onClick={props.onClick}
        >
          {link.text}
        </A>
      )}
    </For>
  );
}