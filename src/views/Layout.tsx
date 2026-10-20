import type { ComponentChildren, VNode } from "preact";
import { Nav } from "./components/Nav.js";
import { ConfirmDialog } from "./components/Confirm.js";
import { Toasts } from "./components/Toasts.js";

export const Layout = ({
  title,
  isAuthenticated,
  children,
}: {
  title: string;
  isAuthenticated: boolean;
  children?: ComponentChildren;
}): VNode => (
<html>
    <head>
        <title>Shoutout - {title}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="style.css" />
        <link rel="icon" href="/favicon.svg" />
        <script type="module" src="/app.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.min.js" integrity="sha384-BvJpBiO8Kh31EqtJe5DRIeWrHWnCGkwytKs9NKFi86Hhw96dEqdEMzZDeK9iEGTc" crossorigin="anonymous"></script>
    </head>
    <body>
        <Nav isAuthenticated={isAuthenticated} />
        <div class="container is-max-desktop">
            {children}

            <ConfirmDialog />
            <Toasts />
        </div>
    </body>
</html>
)