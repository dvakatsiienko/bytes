# financial — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

📌 drafted from the code on 2026-09-28 (BYT-111) while dima was away. every line is ⬜ until a verify run checks it.

## / — landing page

- ⬜ «Every invoice, on one sheet.» landing with a ledger sheet beside it
  - given a visitor who is not logged in
  - when they open `/`
  - then the headline, the pitch line and a «Log in» button show; the ledger sheet shows from the md width up
- ⬜ «Log in» goes to the login form
  - when the visitor clicks «Log in»
  - then `/login` opens

## /login and /signup — account

- ⬜ log in with email and password
  - given a user exists
  - when they fill «Email» and «Password» and press «Log in»
  - then `/dashboard` opens
- ⬜ a wrong login says why
  - when the password is wrong or a field is empty
  - then a red line under the form names the problem and the page stays on `/login`
- ⬜ create an account
  - makes: a user, logged in at once
  - when a visitor fills «Name», «Email» and «Password» on `/signup` and presses «Sign up»
  - then `/dashboard` opens
- ⬜ «Create one» and «Log in» links switch between the two forms
- ⬜ the dashboard is for users only
  - given a visitor who is not logged in
  - when they open any `/dashboard` path
  - then `/login` opens instead
- ⬜ a logged-in user skips the account pages
  - given a user who is logged in
  - when they open `/login` or `/signup`
  - then `/dashboard` opens instead

## /dashboard — sidenav, on every dashboard page

- ⬜ the sidenav: «Home», «Invoices», «Customers», the current page marked
- ⬜ «Sign out»
  - when the user presses «Sign out»
  - then the session ends and `/login` opens
- ⬜ the sidenav turns into an icon row on narrow screens

## /dashboard — overview

- ⬜ four summary cards: «Collected», «Pending», «Total Invoices», «Total Customers»
  - given invoices exist
  - when the user opens `/dashboard`
  - then «Collected» sums the paid invoices and «Pending» the pending ones, in dollars
- ⬜ «Recent revenue», the last 12 months as bars over ledger rules
  - then one bar per month, its height read off the y axis
  - and with no revenue rows it reads «No revenue recorded yet.»
- ⬜ «Latest invoices»: the five newest, with customer picture, name, email and amount
- ⬜ each block shows a skeleton while its data loads

## /dashboard/invoices — invoice list

- ⬜ the invoice table: «Customer», «Email», «Amount», «Date», «Status», with edit and delete per row
- ⬜ status reads as a stamp: «Paid» or «Pending»
- ⬜ search invoices by customer name
  - when the user types in «Search invoices...»
  - then after a short pause only invoices whose customer name contains the text stay, and the page resets to 1
  - and the text lives in the url, so a reload keeps it
- ⬜ pages of six
  - given more than six invoices match
  - when the user picks a page under the table
  - then the next six show
- ⬜ delete an invoice
  - when the user presses the delete button on a row
  - then the invoice is removed from the table
- ⬜ a failed load shows an error with «Try again»

## /dashboard/invoices/create and /[id]/update — invoice form

- ⬜ «Create Invoice»
  - makes: a new invoice for the chosen customer
  - given the user is on `/dashboard/invoices/create`
  - when they choose a customer, an amount and a status, and press «Create Invoice»
  - then `/dashboard/invoices` opens with the new invoice in the table
- ⬜ «Edit Invoice»
  - given the user opened an invoice's edit button
  - then the form opens filled with that invoice
  - when they change a field and press «Edit Invoice»
  - then `/dashboard/invoices` opens with the change in the table
- ⬜ the amount field takes dollars and cents as typed, kept exact in cents
- ⬜ a missing or bad field is named under that field, from the form or from the server
- ⬜ «Cancel» goes back to the list
- ⬜ breadcrumbs: «Invoices» / «Create Invoice» or «Update Invoice»
- ⬜ an unknown invoice id shows a not-found page with «Go Back»

## /dashboard/customers — customer list

- ⬜ the customer table: «Name», «Email», «Invoices», «Pending», «Paid», one card per customer on narrow screens
- ⬜ search customers by name
  - when the user types in «Search customers...»
  - then only customers whose name contains the text stay

## scripts

- ⬜ `pnpm db:seed` fills the database with the sample customers, invoices, revenue and one user
- ⬜ `pnpm db:reinit` wipes the database and seeds it again
- ⬜ `pnpm db:studio` opens prisma studio on the database
