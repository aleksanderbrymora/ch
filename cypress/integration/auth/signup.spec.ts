import faker from "@faker-js/faker";

describe("My First Test", () => {
  it("Does the full registration flow for a new user", () => {
    const username = faker.internet.userName();
    cy.visit("http://localhost:3000/");
    cy.contains("Register").click();
    cy.url().should("include", "/register");
    cy.get("#username-input").type(username).should("have.value", username);
    cy.get("#password-input")
      .type("Chicken123")
      .should("have.value", "Chicken123");
    // cy.get("form").submit();
  });
});

// to shut up typescript and no export errors
export const sup = {};
