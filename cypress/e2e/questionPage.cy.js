describe('Question Page E2E Test', () => {
    beforeEach(() => {
        // Visit the Question Page with a mock questionId
        cy.visit('/questions/1');
    });

    it('should show a notification when trying to upvote the question without logging in', () => {
        cy.get('button[aria-label="This question shows research effort; it is useful and clear"]').click(); // Correct selector for upvote
        cy.contains('You need to be logged in to vote').should('be.visible'); // Verify notification
    });

    it('should show a notification when trying to downvote the question without logging in', () => {
        cy.get('button[aria-label="This question does not show any research effort; it is unclear or not useful"]').click(); // Correct selector for downvote
        cy.contains('You need to be logged in to vote').should('be.visible'); // Verify notification
    });

    it('should show a notification when trying to bookmark the question without logging in', () => {
        cy.get('button[aria-label="Bookmark this question"]').click(); // Correct selector for bookmark
        cy.contains('You need to be logged in to bookmark').should('be.visible'); // Verify notification
    });

    it('should show a notification when trying to follow the question without logging in', () => {
        cy.get('button[aria-label="Follow this question"]').click(); // Correct selector for follow
        cy.contains('You need to be logged in to follow').should('be.visible'); // Verify notification
    });

    it('should show a notification when trying to upvote an answer without logging in', () => {
        cy.get('button[aria-label="This answer is useful"]').first().click(); // Correct selector for upvote on answer
        cy.contains('You need to be logged in to vote').should('be.visible'); // Verify notification
    });

    it('should show a notification when trying to downvote an answer without logging in', () => {
        cy.get('button[aria-label="This answer is not useful"]').first().click(); // Correct selector for downvote on answer
        cy.contains('You need to be logged in to vote').should('be.visible'); // Verify notification
    });

    it('should show a notification when trying to bookmark an answer without logging in', () => {
        cy.get('button[aria-label="Bookmark this answer"]').first().click(); // Correct selector for bookmark on answer
        cy.contains('You need to be logged in to bookmark').should('be.visible'); // Verify notification
    });

    it('should show a notification when trying to add a comment to an answer without logging in', () => {
        // Open the comment section for the first answer
        cy.get('button').contains('Add Comment').first().click();

        // Attempt to submit a comment
        cy.get('textarea[placeholder="Write your comment here..."]').type('Test comment');
        cy.get('button').contains('Submit Comment').click();

        // Verify notification
        cy.contains('You need to be logged in to comment').should('be.visible');
    });
});
