describe('Question List Page', () => {
    beforeEach(() => {
        // Intercept API calls
        cy.intercept('GET', '/questions*').as('getQuestions'); // Intercept all questions API
        cy.intercept('GET', '/tags').as('getTags'); // Intercept tags API

        // Visit the questions page
        cy.visit('/questions');
        cy.wait('@getQuestions');
    });

    it('should display a list of questions', () => {
        // Verify the list of questions exists
        cy.get('.MuiGrid-container').should('exist');

        // Verify at least one question is rendered
        cy.get('.MuiGrid-item').should('have.length.at.least', 1);

        // Verify that the first question has the expected structure
        cy.get('.MuiGrid-item').first().within(() => {
            cy.get('h6').should('contain.text', 'Oil leak');
            cy.get('.MuiChip-root').should('have.length.at.least', 1); // Tags
            cy.get('.MuiTypography-caption').should('exist'); // Metadata like votes, answers
        });
    });

    it('should navigate to the question detail page', () => {
        // Intercept the API call for the question detail
        cy.intercept('GET', '/questions/*').as('getQuestionDetail');
    
        // Click the first question title and trigger the React event
        cy.get('.MuiGrid-item') // Select all grid items
            .first() // Get the first grid item
            .find('h6') // Find the <h6> within that grid item
            .should('not.contain.text', 'About Us') // Ensure it's not the wrong header
            .click() // Click the <h6>
            .then(($el) => {
                // Log the clicked question title for verification
                cy.log(`Clicked question title: ${$el.text()}`);
            });
    
    
        // Verify the URL is updated to include the question ID
        cy.url().should('match', /\/questions\/\d+$/);
    
        // Wait for the question detail API call to complete
        cy.wait('@getQuestionDetail', { timeout: 10000 }).then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            const answers = interception.response.body.answers.content;
            cy.log('Answers returned by API:', answers);
            expect(answers).to.have.length.at.least(1); // Ensure at least one answer exists
        });
        
    });
    
    it('should apply filters and display filtered results', () => {
        // Open the filter panel
        cy.get('.MuiButton-root').contains('Show Filters').click();
        cy.wait('@getTags');
    
        // Type the search text
        cy.get('[placeholder="Search and select tags"]').type('Oil-Leak');
    
        // Wait for dropdown options to load and select the first one
        cy.get('.MuiAutocomplete-popper li[data-option-index="0"]').click();
    
        // Apply the filters
        cy.get('.MuiButton-root').contains('Apply Filter').click();
        cy.wait('@getQuestions');
    
        // Verify that filtered results contain the selected tag
        cy.get('[data-testid="question-grid"] > .MuiGrid-item').each(($el) => {
            // Check that each question item contains the 'Oil-Leak' tag
            cy.wrap($el).should('contain.text', 'Oil-Leak');
        });
    });
    

    

    it('should navigate to the "Ask Question" page', () => {
        // Click on the "Ask Question" button
        cy.get('.MuiButton-root').contains('Ask Question').click();

        // Verify redirection to the "Ask Question" page
        cy.url().should('include', '/askquestion');
    });
});
