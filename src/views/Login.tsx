import { Layout } from "./Layout.js";

export const LoginPage = ({error}: {error: boolean}) => (
    <Layout title="Log In" isAuthenticated={false}>
        <div class="box">
        <form method="POST" action="/login" hx-boost="false">
            {error ? 
                <><span class="tag is-medium is-warning mb-4">Invalid username or password.</span></>
            : <></>}

            <div class="field">
            <label class="label">Username</label>
            <div class="control">
                <input class="input" type="text" name="username" required />
            </div>
            </div>
            <div class="field">
            <label class="label">Password</label>
            <div class="control">
                <input class="input" type="password" name="password" required />
            </div>
            </div>
            <button type="submit" class="button is-primary">Sign in</button>
        </form>
        </div>
    </Layout>
)