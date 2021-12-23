const formatMessage = (operationType, operation, elapsed) => {
    const headerCss = [
        'color: gray; font-weight: lighter', // title
        `color: ${operationType === 'query' ? '#03A9F4' : 'red'};`, // operationType
        'color: inherit;', // operationName
    ];

    const parts = [
        '%c apollo',
        `%c${operationType}`,
        `%c${operation.operationName}`,
    ];

    if (operationType !== 'subscription') {
        parts.push(`%c(in ${elapsed} ms)`);
        headerCss.push('color: gray; font-weight: lighter;'); // time
    }

    return [ parts.join(' '), ...headerCss ];
};

export default formatMessage;
