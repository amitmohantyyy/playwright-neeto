import { Page, expect } from "@playwright/test";
import Dashboard from "./dashboard";

interface LoginPageProps {
    email: string,
    password: string,
}

export default class LoginPage {
    constructor(private page: Page) {
        this.page = page;
    }

    loginAndVerify = async ({ email, password }: LoginPageProps): Promise<Dashboard> => {
        await this.page.getByTestId('login-email-text-field').fill(email);
        await this.page.getByTestId('login-password-text-field').fill(password);
        await this.page.getByTestId('login-submit-button').click();

        //verify
        await expect(this.page.getByTestId('main-header')).toContainText('Active forms');
        
        // Return dashboard since we've navigated there
        return new Dashboard(this.page);
    }
}