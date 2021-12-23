export const formatMoney = (amount = 0) => {
    const options: Intl.NumberFormatOptions = {
        style:                 'currency',
        currency:              'USD',
        minimumFractionDigits: 2,
    };

    if (amount % 100 === 0) {
        options.minimumFractionDigits = 0;
    }

    const formatter = Intl.NumberFormat('en-US', options);

    return formatter.format(amount / 100);
};
