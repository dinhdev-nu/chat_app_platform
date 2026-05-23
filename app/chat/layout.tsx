import type { ReactNode } from "react";

const chatThemeScript = `
(function () {
  try {
    var savedTheme = window.localStorage.getItem("chat-theme");
    var isDark = savedTheme !== "light";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch (_) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: chatThemeScript }} />
      {children}
    </>
  );
}
