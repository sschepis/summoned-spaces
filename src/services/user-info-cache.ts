/* eslint-disable @typescript-eslint/no-explicit-any */
import { communicationManager, type CommunicationMessage } from './communication-manager';

class UserInfoCache {
    private cache: Map<string, { username: string }> = new Map();

    async getUserInfo(userId: string): Promise<{ username: string }> {
        // Check cache first
        if (this.cache.has(userId)) {
            return this.cache.get(userId)!;
        }

        // Fetch from server via SSE
        return new Promise((resolve) => {
            let resolved = false;

            const handleResponse = (message: CommunicationMessage) => {
                if (resolved) return;
                
                if (message.kind === 'searchResponse') {
                    const users = (message.payload as any).users;
                    if (Array.isArray(users)) {
                        const user = users.find((u: any) => u.user_id === userId);
                        if (user) {
                            const info = { username: user.username };
                            this.cache.set(userId, info);
                            resolved = true;
                            resolve(info);
                        }
                    }
                }
            };

            // Register message handler
            communicationManager.onMessage(handleResponse);

            // Send search request
            communicationManager.send({
                kind: 'search',
                payload: { query: userId, category: 'people' }
            }).catch(error => {
                console.error('[UserInfoCache] Error sending search request:', error);
            });

            // Timeout and fallback after 2 seconds
            setTimeout(() => {
                if (!resolved) {
                    const fallback = { username: userId.substring(0, 8) };
                    this.cache.set(userId, fallback);
                    resolved = true;
                    resolve(fallback);
                }
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