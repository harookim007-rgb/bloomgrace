# Faster support chat with image attachments

## What will change
- Save each inquiry immediately, then send the owner email separately so customers are not left waiting.
- Show sent messages and replies as a chat conversation without forcing a separate history screen.
- Let signed-in customers attach image files, preview/remove them before sending, and view them afterward.
- Show attachments in the administrator inquiry view and include secure links in the owner notification email.
- Return a clear delivery status when the owner email cannot be sent.

## Email delivery repair
- The current inquiry was saved successfully, but email delivery is blocked because `bloomgrace.shop` is not verified as a sending domain.
- Set up the project’s verified email domain for `welcometo@bloomgrace.shop`, then use the project email service for reliable delivery.

## Technical details
- Add attachment metadata to inquiries and a protected support attachment storage area scoped to each signed-in customer and administrators.
- Validate image type, count, and size both before upload and inside the inquiry function.
- Deploy and test the updated inquiry function, verify the database record, attachment visibility, response time, and email result.
