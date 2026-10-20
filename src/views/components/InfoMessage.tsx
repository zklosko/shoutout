export const InfoMessage = ({msg}: {msg: string}) => (
    <article class="message is-info">
  <div class="message-header">
    <p>Info</p>
  </div>
  <div class="message-body">
    {msg}
  </div>
</article>
)