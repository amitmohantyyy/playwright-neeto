import { test } from "../fixtures/pageFixture";
import { STORAGE_STATE } from "../../playwright.config";
import LoginPage from "../poms/login";

test.describe("Login page", () => {
    test("should login with correct credentials", async ({ page }) => {
        const loginPage = new LoginPage(page);
        
        await test.step("step 1: navigate to login page", async () => {
            await page.goto('/');
        });
        
        await test.step("step 2: login with credentials", async () => {
            await loginPage.loginAndVerify({
                email: process.env.TEST_USER_EMAIL!,
                password: process.env.TEST_USER_PASSWORD!,
            });
        });
        
        await test.step("step 3: save authentication state for future tests", async () => {
            await page.context().storageState({ path: STORAGE_STATE });
        });
    });
});