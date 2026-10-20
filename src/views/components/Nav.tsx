export const Nav = ({isAuthenticated}: {isAuthenticated: boolean}) => (
    <nav class="level py-4 nav-level">
        <div class="level-left">
            <div class="level-item">
                <p class="title is-5">Shoutout</p>
            </div>
        </div>
        <div class="level-right">
            <p class="level-item"><a href="/">Dashboard</a></p>
            { isAuthenticated ? (
                <><p class="level-item"><a href="/logs">Logs</a></p><p class="level-item"><a href="/settings">Settings</a></p><p class="level-item"><button class="button is-primary" hx-post="/logout">Log out</button></p></>
                ) : (
                <p class="level-item"><a href="/login"><button class="button is-primary">Log in</button></a></p>
                )
            }
        </div>
    </nav>
)