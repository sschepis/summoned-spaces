import { Crown, Shield, Users, MoreVertical, Plus } from 'lucide-react';
import { SpaceMember, SpaceRole } from '../services/space-manager';
import { useAuth } from '../contexts/AuthContext';

interface MemberListProps {
  members: SpaceMember[];
  spaceId: string;
  isUserMember: boolean;
  userRole?: SpaceRole;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: Users
};

const roleColors = {
  owner: 'text-yellow-400 bg-yellow-400/10',
  admin: 'text-red-400 bg-red-400/10',
  member: 'text-blue-400 bg-blue-400/10'
};

export function MemberList({ members, spaceId, isUserMember, userRole }: MemberListProps) {
  const { user } = useAuth();
  
  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };
  
  const getMemberDisplayName = (userId: string) => {
    if (user && userId === user.id) {
      return user.name || user.username || 'You';
    }
    return userId.substring(0, 8); // Placeholder until we have user info
  };
  
  const getMemberEmail = (userId: string) => {
    if (user && userId === user.id) {
      return 'you@summoned.space';
    }
    return `${userId.substring(0, 8)}@summoned.space`;
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Space Members</h2>
          <p className="text-gray-400">{members.length} member{members.length !== 1 ? 's' : ''} in this space</p>
        </div>
        {canManageMembers && (
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white
                           rounded-lg hover:from-blue-400 hover:to-teal-400 transition-all
                           duration-200 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Invite Members</span>
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
            <div className="col-span-5">Member</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-3">Joined</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        
        <div className="divide-y divide-white/10">
          {members.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No members found in this space</p>
            </div>
          ) : (
            members.map((member) => {
              const RoleIcon = roleIcons[member.role];
              const isCurrentUser = user && member.userId === user.id;
              return (
                <div key={member.userId} className="px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400
                                    flex items-center justify-center text-white font-bold text-sm">
                        {getMemberDisplayName(member.userId).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center space-x-2">
                          <span>{getMemberDisplayName(member.userId)}</span>
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{getMemberEmail(member.userId)}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full
                                     text-sm font-medium ${roleColors[member.role]}`}>
                        <RoleIcon className="w-4 h-4" />
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <span className="text-sm text-gray-400">{formatJoinedDate(member.joinedAt)}</span>
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      {canManageMembers && !isCurrentUser && (
                        <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}