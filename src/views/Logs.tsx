import { CodeRow } from "./components/CodeRow.js";
import type { ChildCode } from "./Dashboard.js";
import { Layout } from "./Layout.js";

export const LogsPage = ({logs, auth}: {logs: ChildCode[]; auth: boolean}) => (
    <Layout title="Logs" isAuthenticated={auth}>
    <div class="content">
    <h1 class="title">Logs</h1>
    <button
        class="button is-danger"
        hx-confirm="Delete all child codes? This can't be undone."
        hx-delete="/request/delete/all"
        hx-swap="none"
    >Delete all</button>

    <table class="table is-fullwidth is-hoverable mt-4">
        <thead>
            <th>Child number</th>
            <th>Note</th>
            <th>Status</th>
            <th>Delete</th>
        </thead>
        <tbody id="childcodes">
            {/* Bug below: decision tree for <CodeRow> assumes auth and logs cannot be true at the same time */}
            {logs.map(log => <CodeRow childCode={log} auth={false} logs={true} /> )}
        </tbody>
    </table>
</div>
</Layout>
)