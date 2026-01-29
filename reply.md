- The Trigger: Exactly when does the Content Script ask the Background script for the block status? (On interval? On first play? On script load?)
- > it asks a boolean value for the blockYt so that it can display the appropriate UI

- The Message: What is the structure of the message object being sent?
> i dont know that , i think a event listener that can be used as soon as we load the page as it is only needed to check the main data is fetched from the background.js

- The Background Logic: What steps does the Background worker take once it receives this "check" message?
> it gets the storage.local find the totaltimespent for today , if it is more thant he limit then it will return true else false 

- The Content Script Action: What does it do with the boolean result before the user even clicks "Play"?
> it will display a popup with a message that the user has reached the limit and cannot watch the video