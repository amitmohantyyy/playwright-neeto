import { test, expect, Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { start } from "repl";

test.describe("Form", () => {

    let email: string;
    let formName: string;

    test.beforeEach("Creating fake values", async ({ page }) => {
    
        email = faker.internet.email();
        formName = faker.word.words({ count: 2 });

        await page.goto('/');
        await page.getByRole('button', {name: "Login As Oliver"}).click();
    });

    test.afterEach("Deleting the form from dashboard", async ({ page }) => {
        await page.goto('/');
        
        await page.getByTestId('nui-input-field').fill(formName);
        
        await page.getByTestId('form-count-label').waitFor({ state: 'visible', timeout: 5000 });
        
        const formCountText = await page.getByTestId('form-count-label').innerText();
        
        let countNumber = 0;
        if (formCountText && formCountText.trim().length > 0) {
            countNumber = parseInt(formCountText.split(' ')[0]) || 0;
        }
        
        if (countNumber > 0) {
            
        await page.getByRole('checkbox', { name: 'Select all' }).check();
        await page.getByRole('button', { name: 'Take action' }).click();
        await page.getByRole('button', { name: 'Delete' }).click();
        await page.getByTestId('delete-archive-alert-archive-checkbox').check();
        await page.getByRole('button', { name: 'Delete' }).click();
        }
    });

    test("add and publish a new form with email and phone number", async ({ page }) => {
        
        let name: string;
        name = faker.person.fullName();

        await page.getByTestId('add-form-button').click();
        await page.getByTestId('start-from-scratch-button').click();

        //Adds name field and fills
        const fullNameElementBtn = page.getByRole('button', { name: 'Full name' });
        await fullNameElementBtn.click();

        //Adds phone number field and fills
        const phoneNumberElementBtn = page.getByRole('button', { name: 'Phone number' });
        await phoneNumberElementBtn.click();

        //Change form name
        await page.getByTestId('form-title').click();
        await page.getByTestId('form-rename-text-field').fill(formName);
        await page.getByTestId('form-rename-text-field').press('Enter');

        //Publish form
        await page.getByTestId('publish-button').click();

        // Get the preview button and wait for it with a single robust polling approach
        const previewButton = page.getByTestId("publish-preview-button");
        await expect(async () => {
            const isVisible = await previewButton.isVisible();
            expect(isVisible).toBeTruthy();
            
            const href = await previewButton.getAttribute("href");
            expect(href).toBeTruthy();
            expect(href?.length).toBeGreaterThan(0);
        }).toPass({
            timeout: 30000
        });

        const link = await previewButton.getAttribute("href");

        //New page instance for the form 
        let publishedForm: Page;
        if (link) {
            publishedForm = await page.context().newPage();
            await publishedForm.goto(link);
        } else {
            throw new Error("No link found in the publish preview button");
        }
        
        //Check if all fields are visible 
        await expect(publishedForm.getByTestId('phone-number-input-field')).toBeVisible();
        await expect(publishedForm.getByTestId('email-text-field')).toBeVisible();

        //check with no value
        await publishedForm.getByTestId('email-text-field').fill(' '); 
        await publishedForm.getByTestId('phone-number-input-field').fill(' ');
        await publishedForm.getByTestId('start-or-submit-button').click();
        await expect(publishedForm.getByTestId('phone-group').getByTestId('form-error-text')).toContainText('Phone number is invalid');
        await expect(publishedForm.getByTestId('email-group').getByTestId('form-error-text')).toContainText('Email address is required');

        //check with wrong value
        await publishedForm.getByTestId('email-text-field').fill('wrongemail$12.3in'); 
        await publishedForm.getByTestId('phone-number-input-field').fill('d1cc11ce1cec3');
        await publishedForm.getByTestId('start-or-submit-button').click();
        await expect(publishedForm.getByTestId('phone-group').getByTestId('form-error-text')).toContainText('Phone number is invalid');
        await expect(publishedForm.getByTestId('email-group').getByTestId('form-error-text')).toContainText('Email address is invalid');

        //fill correct values and verify submit
        await publishedForm.getByTestId('email-text-field').fill(email); 
        await publishedForm.getByTestId('first-name-text-field').fill(name.split(' ')[0]);
        await publishedForm.getByTestId('last-name-text-field').fill(name.split(' ')[1]);
        await publishedForm.getByTestId('phone-number-input-field').fill('4082344567');
        await publishedForm.getByTestId('country-code-dropdown').click();

        const countryCodeContainer = publishedForm.getByTestId('phone-number-dropdown-container');
        await countryCodeContainer.getByText(/United States/i).click();
        
        // Submit the form
        await publishedForm.getByTestId('start-or-submit-button').click();

        //Verify 'Thank You' text
        await expect(publishedForm.getByTestId('thank-you-page-message')).toContainText('Thank You');

        //Verify submission on dashboard
        await page.getByTestId('submissions-tab').click();
        await page.getByTestId('submissions-search-text-field').fill(email);
        
        await page.getByTestId('submissions-count-label').waitFor({ state: 'visible', timeout: 5000 });
        
        const submissionCountText = await page.getByTestId('submissions-count-label').innerText();
        
        let countNumber = 0;
        if (submissionCountText && submissionCountText.trim().length > 0) {
            countNumber = parseInt(submissionCountText.split(' ')[0]) || 0;
        }
        
        expect(countNumber).toBe(1);
    });

    test("Customize form field elements", async ({ page }) => {
        await page.getByTestId('add-form-button').click();
        await page.getByTestId('start-from-scratch-button').click();
    
        //Change form name
        await page.getByTestId('form-title').click();
        await page.getByTestId('form-rename-text-field').fill(formName);
        await page.getByTestId('form-rename-text-field').press('Enter');
    
        //Add single options
        await page.getByRole('button', { name: 'Single choice' }).click();
        await expect(page.getByTestId('question-header')).toContainText('Single choice');
        await page.getByTestId('content-text-field').fill('Single Choice Demo');
        await page.getByTestId('add-bulk-option-link').click();
        await page.getByTestId('bulk-add-options-textarea').fill("Option 5, Option 6, Option 7, Option 8, Option 9, Option 10");
        await page.getByTestId('bulk-add-options-done-button').click();
        await page.getByTestId('randomize-switch-label').click();
    
        //Checking for order
        const originalOptionTexts: string[] = [];
        const originalOptionCount = await page.getByTestId('single-choice-option').count();
        for (let i = 0; i < originalOptionCount; i++) {
            const text: string = await page.getByTestId('single-choice-option').nth(i).innerText();
            originalOptionTexts.push(text.trim());
        }
        
        //Add multi options
        await page.getByRole('button', { name: 'Multi choice' }).click();
        await expect(page.getByTestId('question-header')).toContainText('Multi choice');
        await page.getByTestId('content-text-field').fill('Multi Choice Demo');
        //adds option siz times
        for (let counter = 0; counter <= 5; counter++) {
            await page.getByTestId('add-option-link').click();
        };
    
        const hideSwitch = page.getByTestId('hide-question-toggle-label');
        await hideSwitch.scrollIntoViewIfNeeded();
        await hideSwitch.click();
    
        //Publish form
        const publishBtn = page.getByTestId('publish-button');
        await publishBtn.click();
    
        // Get the preview button
        const previewButton = page.getByTestId("publish-preview-button");
        
        await expect(previewButton).not.toBeDisabled({ timeout: 30000 });
        
        // safely get the href attribute
        const link = await previewButton.getAttribute("href");
        expect(link).toBeTruthy();
    
        //New page instance for the form 
        let publishedForm: Page;
        if (link) {
            publishedForm = await page.context().newPage();
            await publishedForm.goto(link);
        } else {
            throw new Error("No link found in the publish preview button");
        }
    
        const publishedOptionTexts: string[] = [];
        const publishedOptionCount = await publishedForm.getByTestId('single-choice-option').count();
        for (let i = 0; i < publishedOptionCount; i++) {
            const text: string = await publishedForm.getByTestId('single-choice-option').nth(i).innerText();
            publishedOptionTexts.push(text.trim());
        }
        
        expect(JSON.stringify(originalOptionTexts) !== JSON.stringify(publishedOptionTexts)).toBeTruthy();
        expect(publishedOptionTexts.sort()).toEqual(originalOptionTexts.sort());
    
        // NOT WORKING
        // await expect(publishedForm.getByTestId('multiple-choice-group')).not.toBeVisible();
        let hiddenElementExists = await publishedForm.locator('text="Multi Choice Demo"').count() > 0;
        expect(hiddenElementExists).toBe(false);
        
        //Unhide multi choice
        //NOT WORKING ON HEADED
        // await page.getByTestId('multiple-choice-preview-group').click();
        await page.getByText('Multi Choice Demo').first().click();
        await hideSwitch.click();
        await publishBtn.click();
    
        //Check visibility
        await publishedForm.reload();
        // await expect(publishedForm.getByText('Multi Choice Demo')).toBeVisible();
        hiddenElementExists = await publishedForm.locator('text="Multi Choice Demo"').count() > 0;
        expect(hiddenElementExists).toBe(true);
        await publishedForm.close();
    });

    test("verify form insights", async ({ page, browser }) => {
        await page.getByTestId('add-form-button').click();
        await page.getByTestId('start-from-scratch-button').click();

        //Change form name
        await page.getByTestId('form-title').click();
        await page.getByTestId('form-rename-text-field').fill(formName);
        await page.getByTestId('form-rename-submit-button').click();

        //Navigate to Analytics
        await page.getByTestId('more-dropdown-icon').click();
        await page.getByTestId('analytics-more-tab').click();

        //Check all data to be zero
        let visits = await page.getByTestId('visits-metric').getByTestId('insights-count').innerText();
        let starts = await page.getByTestId('starts-metric').getByTestId('insights-count').innerText();
        let submissions = await page.getByTestId('submissions-metric').getByTestId('insights-count').innerText();
        let completion = await page.getByTestId('completion-rate-metric').getByTestId('insights-count').innerText();

        expect(visits).toBe('0');
        expect(starts).toBe('0');
        expect(submissions).toBe('0');
        expect(completion).toBe('0%');

        // Publish
        await page.getByTestId('publish-button').click();

        const previewButton = page.getByTestId('publish-preview-button');
        await expect(previewButton).not.toBeDisabled({ timeout: 30000 });
        
        const link = await previewButton.getAttribute("href");
        if (!link) throw new Error("No link found in the publish preview button");

        // First user - just visits the form
        const context1 = await browser.newContext();
        const user1 = await context1.newPage();
        await user1.goto(link);
        await user1.close();
        await context1.close();

        // Check metrics after first visit
        await page.getByTestId('more-dropdown-icon').click();
        await page.getByTestId('analytics-more-tab').click();
        
        await page.reload();
        visits = await page.getByTestId('visits-metric').getByTestId('insights-count').innerText();
        expect(visits).toBe('1');

        // Second user - visits and starts the form
        const context2 = await browser.newContext();
        const user2 = await context2.newPage();
        await user2.goto(link);
        await user2.getByTestId('email-text-field').fill(email);
        await user2.close();
        await context2.close();

        // Check metrics again
        await page.getByTestId('more-dropdown-icon').click();
        await page.getByTestId('analytics-more-tab').click();
        
        await page.reload();
        visits = await page.getByTestId('visits-metric').getByTestId('insights-count').innerText();
        starts = await page.getByTestId('starts-metric').getByTestId('insights-count').innerText();
        expect(visits).toBe('2');
        expect(starts).toBe('1');

        // Third user - visits, fills and submits the form
        const context3 = await browser.newContext();
        const user3 = await context3.newPage();
        await user3.goto(link);
        await user3.getByTestId('email-text-field').fill(email);
        await user3.getByTestId('start-or-submit-button').click();
        await user3.close();
        await context3.close();
        
        // Check metrics after submission
        await page.getByTestId('more-dropdown-icon').click();
        await page.getByTestId('analytics-more-tab').click();
        
        await page.reload();
        visits = await page.getByTestId('visits-metric').getByTestId('insights-count').innerText();
        starts = await page.getByTestId('starts-metric').getByTestId('insights-count').innerText();
        submissions = await page.getByTestId('submissions-metric').getByTestId('insights-count').innerText();
        expect(visits).toBe('3');
        expect(starts).toBe('2');
        expect(submissions).toBe('1');
    });
});