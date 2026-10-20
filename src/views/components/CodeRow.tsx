import type { ChildCode } from "../Dashboard.js";

export const CodeRow = ({
  childCode,
  auth,
  logs,
}: {
  childCode: ChildCode;
  auth: boolean;
  logs: boolean;
}) => (
  <tr
    id={`code-${childCode.childCode}`}
    hx-on:request-rejected={`if (event.detail.childCode === ${childCode.childCode}) this.remove()`}
  >
    <td>{childCode.childCode}</td>
    <td>{childCode.note}</td>
    <td id={`status-${childCode.childCode}`}>{childCode.status}</td>
    <td class="buttons">
      {auth ? (
        <>
          <button
            class="button is-primary"
            hx-post={`/request/approve/${childCode.childCode}`}
            hx-target={`#status-${childCode.childCode}`}
            hx-swap="outerHTML"
          >
            Approve
          </button>
          <button
            class="button is-danger"
            hx-confirm={`Reject submission: ${childCode.childCode}?`}
            hx-post={`/request/reject/${childCode.childCode}`}
            hx-target={`#status-${childCode.childCode}`}
            hx-swap="outerHTML"
          >
            Reject
          </button>
        </>
      ) : logs ? (
        <>
          <button
            class="button is-primary"
            hx-post={`/request/approve/${childCode.childCode}`}
            hx-target={`#status-${childCode.childCode}`}
            hx-swap="outerHTML"
          >
            Retrigger
          </button>
          <button
            class="delete is-medium"
            hx-delete={`/request/delete/${childCode.childCode}`}
            hx-target={`#code-${childCode.childCode}`}
            hx-swap="delete"
          ></button>
        </>
      ) : (
        <>&dash;</>
      )}
    </td>
  </tr>
);
