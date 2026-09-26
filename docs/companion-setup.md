# Bitfocus Companion Integration

Shoutout uses [Bitfocus Companion](https://companion.free) to control ProPresenter instead of implementing ProPresenter's HTTP API locally. Here is the backend's workflow for putting a child code on screen:

1. Shoutout receives a child code and note for the approving user/administrator
2. Said approving user/administrator approves the request
3. Shoutout sends a request to Companion to populate a custom variable with the child code
4. Shoutout sends a request to Companion to simulate pressing a button on a Stream Deck
5. ProPresenter receives the request from Companion

## Setup

> [!IMPORTANT]
> In Companion, use the [ProPresenter API](https://bitfocus.io/connections/renewedvision-propresenter-api) module instead of the older ProPresenter module.

1. In ProPresenter, go to the messages pane on the right side and create a new message with a token for the child code. It can have any name you like and will show up in Companion as a action options field.
2. In Companion, go to Variables > Custom Variables and create a new custom variable
3. In Companion, create a button with the following actions
   - ProPresenter > Message: Operation
     - Message Operation: Show
     - Message: `<your new message in ProPresenter>`
     - `<your token name>`: `<your custom variable name>` (Companion will create this field based on your token in step 1)
4. Test the button to make sure it works correctly on its own
5. In Shoutout, go to Settings and fill out connection details for Companion and the settings for button location (using the `page/row/column` syntax) and custom variable name
6. In Shoutout, try creating a test child code and approving it. It should populate the custom variable in Companion and send the requests to ProPresenter to fill out the message token and display the message
