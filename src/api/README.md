# Backend API: `submit-comment`

This directory contains the serverless function for submitting comments/feedback to the project's GitHub discussions.

## Endpoint: `/api/submit-comment`

This is the public-facing API endpoint that your frontend should call.

### How it Works

1.  It only accepts `POST` requests.
2.  It expects a JSON body with a single field: `comment`.
3.  It uses a secure `GITHUB_TOKEN` stored on the server to authenticate with the GitHub API.
4.  It creates a new discussion in the designated repository with the content provided in the `comment` field.

### Frontend Usage Example

Your frontend should send a `POST` request to `/api/submit-comment`.

```javascript
// Example of how to call this API from your frontend JavaScript/TypeScript
async function submitFeedback(commentText) {
  try {
    const response = await fetch('/api/submit-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: commentText }),
    });

    const result = await response.json();

    if (response.ok) {
      alert('Feedback submitted successfully!');
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    alert('An unexpected error occurred. Please try again later.');
  }
}
```

## Setup and Configuration (CRITICAL)

This function will **not** work without proper configuration.

### 1. Create a GitHub Personal Access Token (PAT)

You must generate a GitHub token so the function can act on your behalf.

1.  Go to [GitHub's Personal Access Token settings](https://github.com/settings/tokens).
2.  Click **"Generate new token"** (select the "classic" version if prompted).
3.  Give it a descriptive name (e.g., `Gxu-Tch-Web-Feedback`).
4.  Set an expiration date (e.g., 90 days).
5.  Under **"Select scopes"**, check the **`public_repo`** scope. This is the minimum permission required to create discussions in a public repository.
6.  Click **"Generate token"** and copy the token immediately. **You will not see it again.**

### 2. Set the Environment Variable

You must set the token you just created as an environment variable named `GITHUB_TOKEN` in your deployment environment. **DO NOT hardcode the token in your source code.**

How you set this depends on your hosting provider:
-   **Vercel:** Go to your Project Settings > Environment Variables.
-   **Netlify:** Go to your Site settings > Build & deploy > Environment.

Add a new variable:
-   **Name:** `GITHUB_TOKEN`
-   **Value:** `ghp_...` (the token you copied from GitHub)

Once this is configured, the `submit-comment.ts` function will be able to authenticate with GitHub and create discussions.
