import { test } from '../fixtures/pageFixture';
import { expect } from '@playwright/test'; 
import { faker } from '@faker-js/faker';

test.describe("Customize form field elements", () => {

    let formName: string;

    test.beforeEach(async ({ page }) => {
        formName = faker.word.words({ count: 2 });
        await page.goto('/');
    });

    test("Create, Publish and Customize form fields", async ({ 
        dashboard,
        formBuilder,
        publishedForm,
        page
    }) => {

        await test.step("Step 1: Navigate to form builder and set name", async () => {
            dashboard.navigateToFormBuilder();
            await formBuilder.setFormName(formName);
        });

        await test.step("Step 2: Configure Single choice field", async () => {
            await formBuilder.addElement("Single choice");
            await formBuilder.renameLabel("Single", "Single Demo");
            await formBuilder.addOptionsBulk("Single", "Option 5, Option 6, Option 7, Option 8, Option 9, Option 10");
            await formBuilder.randomizeOptions("Single");
        });
        
        await test.step("Step 3: Configure Multi choice field", async () => {
            await formBuilder.addElement("Multi choice");
            await formBuilder.renameLabel("Multi", "Multi Demo");
            await formBuilder.addOptions("Multi", 6);
            await formBuilder.hideQuestion("Multi");
        });

        await test.step("Step 4: Publish form and verify Single choice field", async () => {
            await formBuilder.publishForm();

            const url = await formBuilder.returnPublishUrl();
            console.log(url);
            const newPage = await page.context().newPage();
            await newPage.goto(url);
            publishedForm.initialize(newPage);
                
            await publishedForm.formContains('Single Demo');
            expect(publishedForm.verifySingleRandomizedOptions("Option 5, Option 6, Option 7, Option 8, Option 9, Option 10")).toBeTruthy();
        });

        await test.step("Step 5: Check Multi choice visibility (should be hidden)", async () => {
            //Check for hidden multi
            expect(await publishedForm.verifyMultiHidden()).not.toBeTruthy();
        });

        await test.step("Step 6: Toggle Multi choice visibility and verify API response", async () => {
            //Unhide
            await formBuilder.hideQuestion("Multi");

            //wait for API
            const getResponse = await formBuilder.waitForPutThenGet();

            // Get the response JSON and assert
            const responseData = await getResponse.json();
            expect(getResponse.status()).toBe(200);
            expect(responseData.is_published).toBe(true);
        });

        await test.step("Step 7: Verify Multi choice visibility (should be visible)", async () => {
            //Check visibility (True)
            await publishedForm.reload();
            expect(publishedForm.verifyMultiHidden()).toBeTruthy();
        });

        await test.step("Step 8: Clean up - delete form", async () => {
            await dashboard.deleteForm(formName);
        });
    });
});