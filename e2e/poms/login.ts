import { Page, expect } from "@playwright/test";
import { LOGIN_SELECTORS, NAVIGATION_SELECTORS } from "../constants/selectors";

interface LoginPageProps {
    email: string,
    password: string,
}

export default class LoginPage {
    constructor(private page: Page) {
        this.page = page;
    }

    loginAndVerify = async ({ email, password }: LoginPageProps) => {
        await this.page.getByTestId(LOGIN_SELECTORS.emailTextField).fill(email);
        await this.page.getByTestId(LOGIN_SELECTORS.passwordTextField).fill(password);
        await this.page.getByTestId(LOGIN_SELECTORS.submitButton).click();

        //verify
        await expect(this.page.getByTestId(NAVIGATION_SELECTORS.mainHeader)).toContainText('Active forms');
    }
}