describe('Login Flow', () => {
    beforeEach(() => {
        // Visit the login page before each test
        cy.visit('/login');
    });
    
    it('logs in successfully with valid credentials', () => {
        // Intercept the backend login request
        cy.intercept('POST', '/auth/login').as('loginRequest');
    
        // Fill in the login form
        cy.get('#email').type('mock@gmail.com'); 
        cy.get('#password').type('mockpassword'); 
        cy.get('.submitButton').click();
    
        // Wait for the intercepted login request
        cy.wait('@loginRequest').then((interception) => {
        // Verify the request was made correctly
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body).to.have.property('jwtToken'); // Check the response has a token
        });
    
        // Verify successful redirection to the dashboard or homepage
        cy.url().should('eq', 'http://localhost:3000/'); // Replace with your actual post-login URL
    });
    
    it('shows error message with invalid credentials', () => {
        // Fill in the form with invalid credentials
        cy.get('#email').type('wronguser@example.com');
        cy.get('#password').type('wrongpassword');
        cy.get('.submitButton').click();
    
        // Check for the error message in the UI
        cy.get('.MuiSnackbar-root') // Assuming a Snackbar is used for errors
        .should('contain.text', 'Invalid credentials');
    });
    
    it('shows validation errors for empty fields', () => {
        // Submit without filling the form
        cy.get('.submitButton').click();
    
        // Check for validation error messages
        cy.get('#email-helper-text').should('contain', 'Email is required');
        cy.get('#password-helper-text').should('contain', 'Password is required');
    });
    });
    