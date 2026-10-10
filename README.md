# Meridian

**Net worth that explains itself.**

Meridian is a simple net worth tracker for Indian households. Instead of showing only a total, it shows how much of your wealth you could actually turn into cash, how fast, and what is still missing from your data.

It runs entirely in the browser. There is no server, no login, and nothing to install.

## Features

- **Realizable net worth:** your headline net worth minus estimated exit costs and tax.
- **Liquidity ladder:** how much cash you could reach today, this week, this month, in 3 months, and later.
- **Allocation:** automatic classification into Equity, Debt, Commodity, Real Estate, REIT and Alternative assets, with an "Unclassified" slice shown honestly.
- **Mutual fund split:** divide an unsplit mutual fund holding into equity and debt.
- **Cash flow:** monthly income (salary, business, variable) and expenses (fixed, variable, business), with surplus.
- **Runway:** how long assets reachable within 90 days cover your expenses after income.
- **Loans, insurance and dues:** loans by category, insurance policies, and commitments such as premiums owed or undrawn AIF amounts, all counted against net worth.
- **Data health:** a score showing what is missing and what each missing item unlocks.
- **Light and dark mode**, and a layout that works on phones.

## Run it

Open `index.html` in any modern browser.

For automatic refresh while editing, use VS Code with the **Live Server** extension: right-click `index.html` and choose **Open with Live Server**.

## Project files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Colors, layout and styling |
| `app.js` | Data, calculations and screens |

## Customize

All changes happen in `app.js` and `style.css`.

- **Sample data:** edit the `seed()` function.
- **Asset types, liquidity days and cost/tax estimates:** edit the `T` object.
- **Screens:** `home()`, `assets()`, `cash()`, `liab()`, `health()`.
- **Form fields:** `fields()`.
- **Colors:** the variables at the top of `style.css`.

## Your data

Everything you enter is saved in your own browser (local storage) on that device only. It is not sent anywhere. Clearing your browser data removes it. The **Reset to sample data** button on the Data health screen restores the example numbers.

## Important notes

- Exit-cost and tax rates are rough estimates for illustration. They are not tax or investment advice. Review them with a qualified professional before relying on them.
- Sample figures come from a consolidated net worth workbook and do not represent real people.

## Roadmap

- Login and cloud saving
- Statement upload (mutual fund, demat, PMS and AIF) with AI parsing
- Look-through exposure across funds, PMS and AIF
- Returns and XIRR
- Stress tests and scenario planning
- Advisor and family sharing

## Publish on GitHub Pages

In the repository, go to **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, and save. Your app will be live at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.
