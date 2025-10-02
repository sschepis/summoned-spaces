import { useState, useEffect } from 'react';
import { PageLayout } from './layouts/PageLayout';
import { SpaceChat } from './SpaceChat';
import { MemberList } from './MemberList';
import { SpaceSettings } from './SpaceSettings';
import { FileExplorer } from './FileExplorer';
import { SpacePosts } from './SpacePosts';
import { Tabs } from './ui/Tabs';
import { UserAvatar } from './ui/UserAvatar';
import { useAuth } from '../contexts/AuthContext';
import { spaceManager, SpaceMember } from '../services/space-manager';
import webSocketService from '../services/websocket';
import type { Space } from '../types/common';
import type { ServerMessage, PublicSpacesResponseMessage } from '../../server/protocol';
import { ArrowLeft, Crown } from 'lucide-react';


interface SpaceViewProps {
    spaceId: string | null;
    onBack: () => void;
}

type SpaceViewTab = 'posts' | 'chat' | 'files' | 'members' | 'settings';

export function SpaceView({ spaceId, onBack }: SpaceViewProps) {
    const [space, setSpace] = useState<Space | null>(null);
    const [members, setMembers] = useState<SpaceMember[]>([]);
    const [activeTab, setActiveTab] = useState<SpaceViewTab>('posts');
    const { user } = useAuth();

    useEffect(() => {
        const loadSpaceData = async () => {
            if (!spaceId || !user) return;
            
            try {
                // Load space members first
                const spaceMembers = await spaceManager.getSpaceMembers(spaceId);
                setMembers(spaceMembers);
                
                // Check if current user is a member
                const isUserMember = spaceMembers.some(member => member.userId === user.id);
                
                // Fetch space metadata from server
                await new Promise<void>((resolve, reject) => {
                    const handleMessage = (message: ServerMessage) => {
                        if (message.kind === 'publicSpacesResponse') {
                            const spacesMessage = message as PublicSpacesResponseMessage;
                            const allSpaces = spacesMessage.payload.spaces;
                            const currentSpace = allSpaces.find((s) => s.space_id === spaceId);
                            
                            if (currentSpace) {
                                const spaceData: Space = {
                                    id: currentSpace.space_id,
                                    name: currentSpace.name,
                                    description: currentSpace.description,
                                    isPublic: currentSpace.is_public === 1,
                                    isJoined: isUserMember,
                                    memberCount: spaceMembers.length,
                                    tags: ['collaborative', 'quantum-network'],
                                };
                                setSpace(spaceData);
                            } else {
                                // Space not found in public spaces, create minimal representation
                                setSpace({
                                    id: spaceId,
                                    name: `Space ${spaceId.substring(0, 8)}`,
                                    description: 'Private space',
                                    isPublic: false,
                                    isJoined: isUserMember,
                                    memberCount: spaceMembers.length,
                                    tags: ['private'],
                                });
                            }
                            
                            webSocketService.removeMessageListener(handleMessage);
                            resolve();
                        } else if (message.kind === 'error') {
                            webSocketService.removeMessageListener(handleMessage);
                            reject(new Error(message.payload.message));
                        }
                    };
                    
                    webSocketService.addMessageListener(handleMessage);
                    webSocketService.sendMessage({ kind: 'getPublicSpaces' });
                });
                
            } catch (error) {
                console.error('Error loading space data:', error);
                // Fallback with minimal data
                setSpace({
                    id: spaceId,
                    name: `Space ${spaceId.substring(0, 8)}`,
                    description: 'Loading...',
                    isPublic: false,
                    isJoined: false,
                    memberCount: 0,
                    tags: [],
                });
            }
        };
        
        loadSpaceData();
    }, [spaceId, user]);

    // Real-time member updates
    useEffect(() => {
        if (!spaceId || !user) return;

        const handleRealtimeUpdates = async (message: ServerMessage) => {
            // Listen for space member updates (both our own submissions and incoming beacons)
            if (message.kind === 'submitPostSuccess') {
                console.log('Post submitted successfully, checking if it affects space members...');
                // We would need additional logic here to determine if this was a space_members beacon
                // For now, we'll refresh on any post submission to be safe
                try {
                    const updatedMembers = await spaceManager.getSpaceMembers(spaceId);
                    setMembers(updatedMembers);
                    
                    // Update space member count
                    setSpace(prev => prev ? { ...prev, memberCount: updatedMembers.length } : prev);
                } catch (error) {
                    console.error('Error refreshing member list:', error);
                }
            }
            
            // Listen for incoming space member list beacons from other users
            if (message.kind === 'beaconReceived' && message.payload.beaconType === 'space_members') {
                console.log('Received space member list beacon from another user, refreshing...');
                try {
                    // CRITICAL FIX: Don't clear cache when receiving beacon updates
                    // Just refresh the member list - SpaceManager will handle cache properly
                    const updatedMembers = await spaceManager.getSpaceMembers(spaceId);
                    setMembers(updatedMembers);
                    
                    // Update space member count
                    setSpace(prev => prev ? { ...prev, memberCount: updatedMembers.length } : prev);
                } catch (error) {
                    console.error('Error refreshing member list from beacon:', error);
                }
            }
        };

        webSocketService.addMessageListener(handleRealtimeUpdates);
        
        return () => {
            webSocketService.removeMessageListener(handleRealtimeUpdates);
        };
    }, [spaceId, user]);

    const renderTabContent = () => {
        if (!spaceId || !user) return null;
        
        // Check if user is member for access control
        const isUserMember = members.some(member => member.userId === user.id);
        const userRole = members.find(member => member.userId === user.id)?.role;
        
        // Access control: Non-members can only view public spaces and limited content
        const canAccessContent = isUserMember || (space?.isPublic && (activeTab === 'members' || activeTab === 'files'));
        
        if (!canAccessContent) {
            return (
                <div className="text-center py-16">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-white text-2xl">🔒</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Private Space</h3>
                        <p className="text-gray-400 mb-6">
                            You need to be a member to access this space's content.
                        </p>
                        <button
                            onClick={() => handleJoinSpace()}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white
                                     rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all
                                     duration-200 font-medium"
                        >
                            Request to Join
                        </button>
                    </div>
                </div>
            );
        }
        
        switch (activeTab) {
            case 'posts':
                return <SpacePosts
                    spaceId={spaceId}
                    spaceName={space?.name || 'Space'}
                    isUserMember={isUserMember}
                />;
            case 'chat':
                if (!isUserMember) {
                    return (
                        <div className="text-center py-8">
                            <p className="text-gray-400">You must be a member to participate in chat.</p>
                        </div>
                    );
                }
                return <SpaceChat spaceId={spaceId} currentUserId={user.id} />;
            case 'files':
                return <FileExplorer spaceId={spaceId} />;
            case 'members':
                return <MemberList
                    members={members}
                    spaceId={spaceId}
                    isUserMember={isUserMember}
                    userRole={userRole}
                />;
            case 'settings':
                // Only show settings if user is owner or admin
                if (userRole === 'owner' || userRole === 'admin') {
                    return <SpaceSettings spaceId={spaceId} isOpen={true} onClose={() => setActiveTab('posts')} />;
                } else {
                    return (
                        <div className="text-center py-8">
                            <p className="text-gray-400">You don't have permission to access space settings.</p>
                        </div>
                    );
                }
            default:
                return null;
        }
    };

    const handleJoinSpace = async () => {
        if (!spaceId || !user) return;
        
        try {
            await spaceManager.joinSpace(spaceId);
            // Refresh member list
            const updatedMembers = await spaceManager.getSpaceMembers(spaceId);
            setMembers(updatedMembers);
            setSpace(prev => prev ? { ...prev, isJoined: true, memberCount: updatedMembers.length } : prev);
        } catch (error) {
            console.error('Error joining space:', error);
        }
    };

    const owner = members.find(member => member.role === 'owner');

    return (
        <PageLayout>
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{space?.name || 'Loading Space...'}</h1>
                    <p className="text-gray-400 mb-3">{space?.description || 'Loading description...'}</p>
                    {owner && (
                        <div className="flex items-center space-x-2">
                            <Crown className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-400">Space Owner:</span>
                            <div className="flex items-center space-x-2">
                                <UserAvatar
                                    name={owner.userId}
                                    size="xs"
                                />
                                <span className="text-sm font-medium text-white">{owner.userId}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-b border-white/10 mb-8">
                <Tabs
                    tabs={[
                        { id: 'posts', label: 'Posts' },
                        { id: 'files', label: 'Files' },
                        { id: 'chat', label: 'Chat' },
                        { id: 'members', label: `Members (${members.length})` },
                        // Only show settings tab to owners/admins
                        ...((() => {
                            const userMember = members.find(m => m.userId === user?.id);
                            return userMember?.role && ['owner', 'admin'].includes(userMember.role);
                        })() ? [{ id: 'settings', label: 'Settings' }] : [])
                    ]}
                    activeTab={activeTab}
                    onTabChange={(tabId) => setActiveTab(tabId as SpaceViewTab)}
                />
            </div>

            {renderTabContent()}
        </PageLayout>
    );
}