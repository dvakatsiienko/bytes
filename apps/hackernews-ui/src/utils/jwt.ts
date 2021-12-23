const JWT_TOKEN_NAME = process.env.NEXT_PUBLIC_JWT_TOKEN_NAME;

export const getJwtToken = () => {
    const token = localStorage.getItem(JWT_TOKEN_NAME);

    return token;
};

export const saveJwtToken = (token: string) => {
    localStorage.setItem(JWT_TOKEN_NAME, token);
};
