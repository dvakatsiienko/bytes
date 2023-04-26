export const clearLocalStorageAuthItems = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
};
