import { test } from '../fixtures/pageFixture';
import { expect } from '@playwright/test'; 
import { faker } from '@faker-js/faker';
import { VALIDATION_MESSAGES, TEST_DATA } from '../constants/testData';

test.describe("Add Fullname and Phone number, submit a form and verify", () => {
    
    let formName: string;
    let email: string;
    let fullName: string;
    let phoneNumber: string;

    test.beforeEach(async ({ page }) => {
        formName = faker.word.words({ count: 2 });
        email = faker.internet.email();
        fullName = faker.person.fullName();
        phoneNumber = TEST_DATA.valid.phoneNumber;

        await page.goto('/');
    });

    test("Create a form, publish, submit and verify", async ({ 
        dashboard, 
        publishedForm, 
        formBuilder, 
        submissions, 
        page 
    }) => {

        await test.step("Step 1: Set up the form", async () => {
            dashboard.navigateToFormBuilder();
            await formBuilder.setFormName(formName);
            await formBuilder.addElement('Full name');
            await formBuilder.addElement('Phone number');
        });
        
        await test.step("Step 2: Publish the form", async () => {
            await formBuilder.publishForm();
            const url = await formBuilder.returnPublishUrl();
            console.log(url);
            const newPage = await page.context().newPage();
            await newPage.goto(url);
            publishedForm.initialize(newPage);

            await publishedForm.formContains('Full name');
            await publishedForm.formContains('Phone number');
        });
        
        await test.step("Step 3: Test form validation scenarios", async () => {
            // Invalid email test
            await publishedForm.fillEmail(TEST_DATA.invalid.email);
            await publishedForm.submitForm();
            expect(await publishedForm.hasSpecificError(VALIDATION_MESSAGES.invalidEmail)).toBeTruthy();
            
            // Invalid phone number test
            await publishedForm.fillEmail(email);
            await publishedForm.fillPhoneNumberAndCountry(TEST_DATA.invalid.phoneNumber, TEST_DATA.valid.country);
            await publishedForm.submitForm();
            expect(await publishedForm.hasSpecificError(VALIDATION_MESSAGES.invalidPhone)).toBeTruthy();
            
            // Empty fields test
            await publishedForm.fillEmail(TEST_DATA.invalid.emptyString);
            await publishedForm.fillPhoneNumberAndCountry(TEST_DATA.invalid.emptyString, TEST_DATA.valid.country);
            await publishedForm.submitForm();
            expect(await publishedForm.hasSpecificError(VALIDATION_MESSAGES.requiredEmail)).toBeTruthy();
            expect(await publishedForm.hasSpecificError(VALIDATION_MESSAGES.invalidPhone)).toBeTruthy();
        });
        
        await test.step("Step 4: Submit the form with valid data", async () => {
            await publishedForm.fillEmail(email);
            await publishedForm.fillFullname(fullName);
            await publishedForm.fillPhoneNumberAndCountry(phoneNumber, TEST_DATA.valid.country);
            await publishedForm.submitForm();
            await publishedForm.verifySubmission();
        });
        
        await test.step("Step 5: Verify submission in admin panel", async () => {
            await formBuilder.navigateToSubmissionsTab();
            await submissions.verifySubmission(email);
        });
        
        await test.step("Step 6: Clean up - Delete the form", async () => {
            await dashboard.deleteForm(formName);
        });
    });
});