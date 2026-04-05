import { expect, test } from "@playwright/test";

test("dev-loop: interactions, console, colors, theme", async ({ page }) => {
  test.setTimeout(60_000);

  const consoleMessages: { type: string; text: string }[] = [];
  page.on("console", (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  await page.goto("/dev-loop");

  await page.getByLabel("Name").fill("Codex");
  await page.getByTestId("btn-submit").click();
  await expect(page.getByTestId("last-action")).toContainText("submit:name:Codex");

  await page.getByTestId("btn-console-signals").click();
  await expect.poll(() => consoleMessages.map((m) => m.text).join("\n")).toContain(
    "dev-loop:console:log"
  );
  await expect.poll(() => consoleMessages.map((m) => m.text).join("\n")).toContain(
    "dev-loop:console:warn"
  );
  await expect.poll(() => consoleMessages.map((m) => m.text).join("\n")).toContain(
    "dev-loop:console:handled-error"
  );

  const probeResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/health?probe=dev-loop") &&
      response.request().method() === "GET"
  );
  await page.getByTestId("btn-network-probe").click();
  const probeResponse = await probeResponsePromise;
  expect(probeResponse.ok()).toBeTruthy();
  await expect(page.getByTestId("network-probe-result")).toContainText("status=200");
  await expect(page.getByTestId("network-probe-result")).toContainText("ok=true");
  await expect(page.getByTestId("network-probe-result")).toContainText(
    "path=/api/health?probe=dev-loop"
  );
  await expect.poll(() => consoleMessages.map((m) => m.text).join("\n")).toContain(
    "dev-loop:network:probe:200:true"
  );

  await expect(page.getByTestId("counter-value")).toHaveText("0");
  await page.getByTestId("counter-inc").click();
  await page.getByTestId("counter-inc").click();
  await expect(page.getByTestId("counter-value")).toHaveText("2");
  await expect.poll(() => consoleMessages.map((m) => m.text).join("\n")).toContain(
    "dev-loop:counter:set:2"
  );
  await page.getByTestId("counter-dec").click();
  await expect(page.getByTestId("counter-value")).toHaveText("1");
  await page.getByTestId("counter-reset").click();
  await expect(page.getByTestId("counter-value")).toHaveText("0");

  await page.getByTestId("btn-refresh-colors").click();
  const bgLight = await page.locator('[data-token="--background"]').evaluate((el) => {
    return getComputedStyle(el as HTMLElement).backgroundColor;
  });
  expect(bgLight).toMatch(/\w+\(.+\)/);

  await page.getByTestId("theme-toggle").click();
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await expect(menu).toBeVisible();
  await menu.getByText("Dark", { exact: true }).click();
  await page.getByTestId("btn-refresh-colors").click();
  const bgAfterDark = await page
    .locator('[data-token="--background"]')
    .evaluate((el) => getComputedStyle(el as HTMLElement).backgroundColor);

  expect(bgAfterDark).toMatch(/\w+\(.+\)/);
  expect(bgAfterDark).not.toEqual(bgLight);
});
