# financial

an invoicing dashboard for a small business: what has been billed, what has been paid, and what is still owed.

## Language

**Customer**:
a person or company the business bills.
_Avoid_: client, account

**Invoice**:
one bill sent to one customer, for one amount, on one date.
_Avoid_: bill, charge, transaction

**Amount**:
what an invoice asks for, in dollars and cents, kept exact.
_Avoid_: price, total (for a single invoice)

**Status**:
where an invoice stands: pending or paid, nothing else.
_Avoid_: state, stage

**Pending**:
the status of an invoice not paid yet; also the sum of every pending invoice.
_Avoid_: unpaid, open, due

**Paid**:
the status of an invoice the customer has settled.
_Avoid_: closed, done, settled

**Collected**:
the sum of every paid invoice.
_Avoid_: income, earned

**Revenue**:
the money the business took in during one month, shown as a bar per month.
_Avoid_: sales, turnover

**User**:
a person who logs in to the dashboard; not a customer.
_Avoid_: member, customer (for the person logging in)
