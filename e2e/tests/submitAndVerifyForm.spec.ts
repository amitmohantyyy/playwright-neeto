import { test } from '../fixtures/pageFixture';
import { expect } from '@playwright/test'; 
import { faker } from '@faker-js/faker';

test.describe("Add Fullname and Phone number, submit a form and verify", () => {
    
    let formName: string;
    let email: string;
    let fullName: string;
    let phoneNumber: string;

    test.beforeEach(async ({ page }) => {
        formName = faker.word.words({ count: 2 });
        email = faker.internet.email();
        fullName = faker.person.fullName();
        phoneNumber = "4082344567";

        await page.goto('/');
    });

    test("Create a form, publish, submit and verify", async ({ dashboard, browser }) => {
        const formBuilder = await dashboard.navigateToFormBuilder();
        await formBuilder.setFormName(formName);
        await formBuilder.addElement('Full name');
        await formBuilder.addElement('Phone number');
        
        await formBuilder.publishForm();
        const publishedForm = await formBuilder.openPublishedForm(browser);
        
        await publishedForm.formContains('Full name');
        await publishedForm.formContains('Phone number');
        
        await publishedForm.fillEmail("invalid-email@123");
        await publishedForm.submitForm();
        expect(await publishedForm.hasSpecificError('Email address is invalid')).toBeTruthy();
        
        await publishedForm.fillEmail(email);
        await publishedForm.fillPhoneNumberAndCountry('7873458', 'United States');
        await publishedForm.submitForm();
        expect(await publishedForm.hasSpecificError('Phone number is invalid')).toBeTruthy();
        
        await publishedForm.fillEmail('');
        await publishedForm.fillPhoneNumberAndCountry('', 'United States');
        await publishedForm.submitForm();
        expect(await publishedForm.hasSpecificError('Email address is required')).toBeTruthy();
        expect(await publishedForm.hasSpecificError('Phone number is invalid')).toBeTruthy();
        
        await publishedForm.fillEmail(email);
        await publishedForm.fillFullname(fullName);
        await publishedForm.fillPhoneNumberAndCountry(phoneNumber, 'United States');
        await publishedForm.submitForm();
        await publishedForm.verifySubmission();
        await publishedForm.close();
        
        const submissionsPage = await formBuilder.navigateToSubmissionsTab();
        await submissionsPage.verifySubmission(email);
        
        const dashboardPage = await submissionsPage.navigateToDashboard();
        await dashboardPage.deleteForm(formName);
    });
});