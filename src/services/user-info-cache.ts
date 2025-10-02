import webSocketService from './websocket';

class UserInfoCache {
    private cache: Map<string, { username: string }> = new Map();

    async getUserInfo(userId: string): Promise<{ username: string }> {
        // Check cache first
        if (this.cache.has(userId)) {
            return this.cache.get(userId)!;
        }

        // Fetch from server
        return new Promise((resolve) => {
            const handleResponse = (message: any) => {
                if (message.kind === 'searchResponse') {
                    const user = message.payload.users.find((u: any) => u.user_id === userId);
                    if (user) {
                        const info = { username: user.username };
                        this.cache.set(userId, info);
                        webSocketService.removeMessageListener(handleResponse);
                        resolve(info);
                    }
                }
            };

            webSocketService.addMessageListener(handleResponse);
            webSocketService.sendMessage({
                kind: 'search',
                payload: { query: userId, category: 'people' }
            });

            // Timeout and fallback after 2 seconds
            setTimeout(() => {
                webSocketService.removeMessageListener(handleResponse);
                const fallback = { username: userId.substring(0, 8) };
                this.cache.set(userId, fallback);
                resolve(fallback);
            }, 2000);
        });
    }

    getDisplayName(userId: string): string {
        const info = this.cache.get(userId);
        return info?.username || userId.substring(0, 8);
    }

    setUserInfo(userId: string, username: string): void {
        this.cache.set(userId, { username });
    }
}

export const userInfoCache = new UserInfoCache();