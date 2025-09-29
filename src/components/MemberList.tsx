import { Crown, Shield, CreditCard as Edit3, Eye, MoreVertical, Plus } from 'lucide-react';

const members = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    email: 's.chen@quantum.lab',
    role: 'owner',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastActive: '2 minutes ago',
    resonanceContribution: 0.32
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'm.rodriguez@research.org',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastActive: '1 hour ago',
    resonanceContribution: 0.28
  },
  {
    id: '3',
    name: 'Dr. Amanda Liu',
    email: 'a.liu@institute.edu',
    role: 'contributor',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastActive: '5 hours ago',
    resonanceContribution: 0.24
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'j.wilson@tech.com',
    role: 'contributor',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastActive: '1 day ago',
    resonanceContribution: 0.16
  },
  {
    id: '5',
    name: 'Elena Kowalski',
    email: 'e.kowalski@university.ac',
    role: 'viewer',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastActive: '3 days ago',
    resonanceContribution: 0.00
  }
];

const roleIcons = {
  owner: Crown,
  admin: Shield,
  contributor: Edit3,
  viewer: Eye
};

const roleColors = {
  owner: 'text-yellow-400 bg-yellow-400/10',
  admin: 'text-red-400 bg-red-400/10',
  contributor: 'text-blue-400 bg-blue-400/10',
  viewer: 'text-gray-400 bg-gray-400/10'
};

export function MemberList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Space Members</h2>
          <p className="text-gray-400">Manage access and permissions</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white 
                         rounded-lg hover:from-blue-400 hover:to-teal-400 transition-all 
                         duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Invite Members</span>
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
            <div className="col-span-4">Member</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Contribution</div>
            <div className="col-span-2">Last Active</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        
        <div className="divide-y divide-white/10">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
            return (
              <div key={member.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center space-x-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                    />
                    <div>
                      <div className="font-medium text-white">{member.name}</div>
                      <div className="text-sm text-gray-400">{member.email}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full 
                                   text-sm font-medium ${roleColors[member.role as keyof typeof roleColors]}`}>
                      <RoleIcon className="w-4 h-4" />
                      <span className="capitalize">{member.role}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    {member.role === 'viewer' ? (
                      <span className="text-gray-500 text-sm">Read-only</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full"
                            style={{ width: `${member.resonanceContribution * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-cyan-400">
                          {(member.resonanceContribution * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm text-gray-400">{member.lastActive}</span>
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}