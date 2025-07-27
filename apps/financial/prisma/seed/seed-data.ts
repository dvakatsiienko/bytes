// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data
const users = [
  {
    email: 'user@nextmail.com',
    name: 'User',
    password: '123456',
  },
];

const customers = [
  {
    email: 'evil@rabbit.com',
    id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
    imageUrl: '/customers/evil-rabbit.png',
    name: 'Evil Rabbit',
  },
  {
    email: 'delba@oliveira.com',
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    imageUrl: '/customers/delba-de-oliveira.png',
    name: 'Delba de Oliveira',
  },
  {
    email: 'lee@robinson.com',
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    imageUrl: '/customers/lee-robinson.png',
    name: 'Lee Robinson',
  },
  {
    email: 'michael@novotny.com',
    id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
    imageUrl: '/customers/michael-novotny.png',
    name: 'Michael Novotny',
  },
  {
    email: 'amy@burns.com',
    id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
    imageUrl: '/customers/amy-burns.png',
    name: 'Amy Burns',
  },
  {
    email: 'balazs@orban.com',
    id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
    imageUrl: '/customers/balazs-orban.png',
    name: 'Balazs Orban',
  },
];

const invoices = [
  {
    amount: 15_795,
    createdAt: '2022-12-06',
    customerId: customers[0].id,
    status: 'pending',
  },
  {
    amount: 20_348,
    createdAt: '2022-11-14',
    customerId: customers[1].id,
    status: 'pending',
  },
  {
    amount: 3040,
    createdAt: '2022-10-29',
    customerId: customers[4].id,
    status: 'paid',
  },
  {
    amount: 44_800,
    createdAt: '2023-09-10',
    customerId: customers[3].id,
    status: 'paid',
  },
  {
    amount: 34_577,
    createdAt: '2023-08-05',
    customerId: customers[5].id,
    status: 'pending',
  },
  {
    amount: 54_246,
    createdAt: '2023-07-16',
    customerId: customers[2].id,
    status: 'pending',
  },
  {
    amount: 666,
    createdAt: '2023-06-27',
    customerId: customers[0].id,
    status: 'pending',
  },
  {
    amount: 32_545,
    createdAt: '2023-06-09',
    customerId: customers[3].id,
    status: 'paid',
  },
  {
    amount: 1250,
    createdAt: '2023-06-17',
    customerId: customers[4].id,
    status: 'paid',
  },
  {
    amount: 8546,
    createdAt: '2023-06-07',
    customerId: customers[5].id,
    status: 'paid',
  },
  {
    amount: 500,
    createdAt: '2023-08-19',
    customerId: customers[1].id,
    status: 'paid',
  },
  {
    amount: 8945,
    createdAt: '2023-06-03',
    customerId: customers[5].id,
    status: 'paid',
  },
  {
    amount: 1000,
    createdAt: '2022-06-05',
    customerId: customers[2].id,
    status: 'paid',
  },
].map((invoice) => {
  return { ...invoice, createdAt: new Date(invoice.createdAt).toISOString() };
});

const revenue = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 3200 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 3700 },
  { month: 'Sep', revenue: 2500 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 3000 },
  { month: 'Dec', revenue: 4800 },
];

export { users, customers, invoices, revenue };
