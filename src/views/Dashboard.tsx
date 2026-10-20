import { CodeRow } from "./components/CodeRow.js";
import { InfoMessage } from "./components/InfoMessage.js";
import { Layout } from "./Layout.js";

export type ChildCode = {
    childCode: string;
    note?: string;
    status: string;
}

export const DashboardPage = ({childCodes, infoText, auth}: {childCodes: ChildCode[]; infoText: string | undefined; auth: boolean}) => (
    <Layout title="Dashboard" isAuthenticated={auth}>
        <div class="content">
    <h1 class="title">Dashboard</h1>
    {infoText && <InfoMessage msg={infoText} />}

    <div class="box">
        <h2 class="subtitle">Submit a new child number</h2>
        <form hx-post="/request/new" hx-target="#childcodes" hx-swap="afterbegin">
            <div class="field">
                <label for="childCode">Child Code</label>
                <div class="control">
                    <input class="input" type="text" name="childCode" placeholder="123" />
                </div>
            </div>
            <div class="field">
                <label for="note">Note (optional)</label>
                <div class="control">
                    <input class="input" type="text" name="note" placeholder="Mom needs to come get him" />
                </div>
            </div>

            <div class="field is-grouped mt-5">
                <p class="control">
                    <button class="button is-primary" type="submit">Submit</button>
                </p>
                <p class="control">
                    <button class="button is-secondary" type="reset">Reset</button>
                </p>
            </div>
        </form>
    </div>

    <h2 class="subtitle mt-4">Submissions</h2>
    <table class="table is-fullwidth is-hoverable">
        <thead>
            <th>Child number</th>
            <th>Note</th>
            <th>Status</th>
            <th>Actions</th>
        </thead>
        <tbody id="childcodes">
            {childCodes.map(c => <CodeRow childCode={c} auth={auth} logs={true} /> )}
        </tbody>
    </table>
</div>
    </Layout>
)