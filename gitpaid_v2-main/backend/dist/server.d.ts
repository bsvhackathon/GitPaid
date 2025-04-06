interface UserDocument {
    githubId: string;
    username: string;
    displayName: string;
    emails: string[];
    avatarUrl: string;
    accessToken: string;
    refreshToken?: string;
    createdAt: Date;
    lastLogin?: Date;
    walletBalance: number;
}
declare global {
    namespace Express {
        interface User extends UserDocument {
        }
    }
}
export {};
