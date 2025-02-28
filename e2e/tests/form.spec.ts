import { test } from '../fixtures/formFixture';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { FormDashboardPage } from '../poms/formDashboard';

test.describe("Form", () => {
    let email: string;
    let formName: string;
    let fullName: string;

    test.beforeEach(async () => {
        email = faker.internet.email();
        formName = faker.word.words({ count: 2 });
        fullName = faker.person.fullName();
    });

    test.afterEach(async ({ formDashboard }) => {
        await formDashboard.deleteForm(formName);
    });

    test("add and publish a new form with email and phone number", async ({ 
        formDashboard,
        formEditor,
        page
    }) => {
        await formDashboard.createNewForm();
        await formEditor.addFullNameField();
        await formEditor.addPhoneNumberField();

        await formEditor.setFormName(formName);
        await page.waitForTimeout(1000);
        const publishUrl = await formEditor.publishForm();
        expect(publishUrl).toBeTruthy();
        
        const publishedPage = await page.context().newPage();
        await publishedPage.goto(publishUrl!);
        
        await expect(publishedPage.getByTestId('phone-number-input-field')).toBeVisible();
        await expect(publishedPage.getByTestId('email-text-field')).toBeVisible();
        
        await publishedPage.getByTestId('email-text-field').fill(' ');
        await publishedPage.getByTestId('phone-number-input-field').fill(' ');
        await publishedPage.getByTestId('start-or-submit-button').click();
        await expect(publishedPage.getByTestId('phone-group').getByTestId('form-error-text')).toContainText('Phone number is invalid');
        await expect(publishedPage.getByTestId('email-group').getByTestId('form-error-text')).toContainText('Email address is required');
        
        await publishedPage.getByTestId('email-text-field').fill('wrongemail$12.3in');
        await publishedPage.getByTestId('phone-number-input-field').fill('d1cc11ce1cec3');
        await publishedPage.getByTestId('start-or-submit-button').click();
        await expect(publishedPage.getByTestId('phone-group').getByTestId('form-error-text')).toContainText('Phone number is invalid');
        await expect(publishedPage.getByTestId('email-group').getByTestId('form-error-text')).toContainText('Email address is invalid');
        
        await publishedPage.getByTestId('email-text-field').fill(email);
        await publishedPage.getByTestId('first-name-text-field').fill(fullName.split(' ')[0]);
        await publishedPage.getByTestId('last-name-text-field').fill(fullName.split(' ')[1]);
        await publishedPage.getByTestId('phone-number-input-field').fill('4082344567');
        await publishedPage.getByTestId('country-code-dropdown').click();
        
        const countryCodeContainer = publishedPage.getByTestId('phone-number-dropdown-container');
        await countryCodeContainer.getByText(/United States/i).click();
        
        await publishedPage.getByTestId('start-or-submit-button').click();
        
        await expect(publishedPage.getByTestId('thank-you-page-message')).toContainText('Thank You');
        
        await page.getByTestId('submissions-tab').click();
        await page.getByTestId('submissions-search-text-field').fill(email);
        await page.getByTestId('submissions-count-label').waitFor({ state: 'visible', timeout: 5000 });
        
        const submissionCountText = await page.getByTestId('submissions-count-label').innerText();
        let countNumber = 0;
        if (submissionCountText && submissionCountText.trim().length > 0) {
            countNumber = parseInt(submissionCountText.split(' ')[0]) || 0;
        }
        expect(countNumber).toBe(1);
        
        await publishedPage.close();
    });
    
    test("Customize form field elements", async ({ 
        formDashboard,
        formEditor,
        simulateUser,
        page
    }) => {
        const spinner = page.getByTestId('neeto-ui-spinner');
        
        await formDashboard.createNewForm();
        await formEditor.setFormName(formName);
        
        await formEditor.addSingleChoiceField('Single Choice Demo', ['Option 5', 'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10']);
        await page.getByTestId('randomize-switch-label').click();
        
        const originalOptionTexts = await formEditor.getSingleChoiceOptions();
        
        await formEditor.addMultiChoiceField('Multi Choice Demo', 5);
        
        const hideSwitch = page.getByTestId('hide-question-toggle-label');
        await hideSwitch.scrollIntoViewIfNeeded();
        await hideSwitch.click();
        
        await expect(spinner).toBeVisible();
        await expect(spinner).toBeHidden();
        
        const publishBtn = page.getByTestId('publish-button');
        await page.waitForTimeout(1000);
        await publishBtn.click();
        
        const previewButton = page.getByTestId("publish-preview-button");
        await expect(previewButton).not.toBeDisabled({ timeout: 30000 });
        const link = await previewButton.getAttribute("href");
        expect(link).toBeTruthy();
        
        let publishedForm = await simulateUser(link!);
        
        const publishedOptionTexts = await publishedForm.getSingleChoiceOptions();
        
        expect(JSON.stringify(originalOptionTexts) !== JSON.stringify(publishedOptionTexts)).toBeTruthy();
        
        await expect(publishedForm.page.getByTestId('form-group-question').filter({ hasText: 'Multi Choice Demo'})).toBeHidden();
        
        await page.getByText('Multi Choice Demo').first().click();
        await hideSwitch.click();
        await page.waitForTimeout(1000);
        await publishBtn.click();
        
        publishedForm = await simulateUser(link!);
        
        await expect(publishedForm.page.getByTestId('form-group-question').filter({ hasText: 'Multi Choice Demo'})).toBeVisible();
        
        await publishedForm.page.close();
    });
    
    test("verify form insights", async ({
        formDashboard,
        formEditor,
        analyticsPage,
        simulateUser,
        page,
        browser
    }) => {
        await formDashboard.createNewForm();
        await formEditor.setFormName(formName);
        
        await analyticsPage.open();
        await analyticsPage.expectMetrics({
            visits: '0',
            starts: '0',
            submissions: '0',
            completion: '0%'
        });
        
        await page.waitForTimeout(1000);
        await page.getByTestId('publish-button').click();
        const previewButton = page.getByTestId('publish-preview-button');
        await expect(previewButton).not.toBeDisabled({ timeout: 30000 });
        const link = await previewButton.getAttribute("href");
        if (!link) throw new Error("No link found in the publish preview button");
        
        const context1 = await browser.newContext();
        const user1 = await context1.newPage();
        await user1.goto(link);
        await user1.close();
        await context1.close();
        
        await analyticsPage.open();
        const metricsAfterVisit = await analyticsPage.getMetrics();
        expect(metricsAfterVisit.visits).toBe('1');
        
        const context2 = await browser.newContext();
        const user2 = await context2.newPage();
        await user2.goto(link);
        await user2.getByTestId('email-text-field').fill(email);
        await user2.close();
        await context2.close();
        
        await analyticsPage.open();
        const metricsAfterStart = await analyticsPage.getMetrics();
        expect(metricsAfterStart.visits).toBe('2');
        expect(metricsAfterStart.starts).toBe('1');
        
        const context3 = await browser.newContext();
        const user3 = await context3.newPage();
        await user3.goto(link);
        await user3.getByTestId('email-text-field').fill(email);
        await user3.getByTestId('start-or-submit-button').click();
        await user3.close();
        await context3.close();
        
        await analyticsPage.open();
        const metricsAfterSubmission = await analyticsPage.getMetrics();
        expect(metricsAfterSubmission.visits).toBe('3');
        expect(metricsAfterSubmission.starts).toBe('2');
        expect(metricsAfterSubmission.submissions).toBe('1');
    });
});