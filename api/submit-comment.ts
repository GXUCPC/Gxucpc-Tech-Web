// api/submit-comment.ts

// This is a serverless function that accepts a POST request with a JSON body
// containing a "comment" field. It then uses the GitHub GraphQL API to create
// a new discussion in a specified repository.
//
// This function is designed to be deployed on platforms like Vercel or Netlify,
// which automatically handle routing for files in the `api` directory.

// Define a type for the expected request body for type safety.
interface RequestBody {
    comment: string;
}

// Define a generic type for the request and response objects,
// similar to what you'd find in Express or serverless function environments.
// This makes the code more portable.
interface ApiRequest {
    method?: string;
    body: RequestBody;
}

interface ApiResponse {
    status: (code: number) => {
        json: (body: any) => void;
    };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const { comment } = req.body;

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
        res.status(400).json({ message: 'Comment cannot be empty.' });
        return;
    }

    // These IDs are specific to your repository and discussion category.
    // They were retrieved from the original Giscus configuration.
    const repositoryId = 'R_kgDOQwpnQw';
    const categoryId = 'DIC_kwDOQwpnQ84C0WnN';
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
        console.error('GitHub token is not configured.');
        // Return a generic error to the client for security.
        res.status(500).json({ message: 'Internal Server Error: Server configuration is incomplete.' });
        return;
    }

    // The title for the new discussion. You can customize this.
    const title = `New feedback received on ${new Date().toISOString()}`;

    // The GraphQL mutation for creating a discussion.
    const graphqlMutation = {
        query: `
            mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
              createDiscussion(input: {
                repositoryId: $repoId,
                categoryId: $categoryId,
                title: $title,
                body: $body
              }) {
                discussion {
                  url
                }
              }
            }
        `,
        variables: {
            repoId: repositoryId,
            categoryId: categoryId,
            title: title,
            body: comment,
        },
    };

    try {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Gxucpc-Tech-Web-Feedback-Agent',
            },
            body: JSON.stringify(graphqlMutation),
        });

        const responseData = await response.json();

        if (!response.ok || responseData.errors) {
            console.error('GitHub API Error:', responseData.errors || 'Unknown error');
            res.status(500).json({ message: 'Failed to submit comment to GitHub.' });
            return;
        }

        // Successfully created the discussion.
        res.status(201).json({ message: 'Comment submitted successfully.' });

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        res.status(500).json({ message: 'An unexpected error occurred while submitting the comment.' });
    }
}
