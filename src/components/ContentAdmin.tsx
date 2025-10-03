import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Flag, Eye, Trash2, CheckCircle, XCircle, MessageCircle, Globe, TrendingUp, AlertTriangle, Megaphone, FileText } from 'lucide-react';

interface ContentAdminProps {
  onBack: () => void;
}

interface ReportedContent {
  id: string;
  type: string;
  content: string;
  author: string;
  reporter: string;
  reason: string;
  timestamp: string;
  status: string;
  reportCount: number;
}

interface UserStat {
  id: string;
  name: string;
  username: string;
  status: string;
  joinDate: string;
  posts: number;
  followers: number;
  reports: number;
  lastActive: string;
}

interface SpaceStat {
  id: string;
  name: string;
  creator: string;
  members: number;
  posts: number;
  status: string;
  created: string;
  reports: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  status: string;
  created: string;
  views: number;
}

export function ContentAdmin({ onBack }: ContentAdminProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'spaces' | 'posts' | 'analytics' | 'announcements' | 'policies'>('reports');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [spaceStats, setSpaceStats] = useState<SpaceStat[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const tabs = [
    { id: 'reports', label: 'Content Reports', icon: Flag },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'spaces', label: 'Space Management', icon: Globe },
    { id: 'posts', label: 'Post Moderation', icon: MessageCircle },
    { id: 'analytics', label: 'Content Analytics', icon: TrendingUp },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'policies', label: 'Policies', icon: FileText }
  ];

  useEffect(() => {
    loadContentData();
  }, [activeTab]);

  const loadContentData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'reports': {
          const reportsRes = await fetch('/api/admin/content/reports');
          if (reportsRes.ok) {
            setReportedContent(await reportsRes.json());
          }
          break;
        }
        case 'users': {
          const usersRes = await fetch('/api/admin/users/stats');
          if (usersRes.ok) {
            setUserStats(await usersRes.json());
          }
          break;
        }
        case 'spaces': {
          const spacesRes = await fetch('/api/admin/spaces/stats');
          if (spacesRes.ok) {
            setSpaceStats(await spacesRes.json());
          }
          break;
        }
        case 'announcements': {
          const announcementsRes = await fetch('/api/admin/announcements');
          if (announcementsRes.ok) {
            setAnnouncements(await announcementsRes.json());
          }
          break;
        }
      }
    } catch (err) {
      console.error('Failed to load content data:', err);
      setError('Failed to load data. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleContentAction = async (contentId: string, action: 'approve' | 'remove' | 'flag') => {
    try {
      const response = await fetch(`/api/admin/content/${contentId}/${action}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} content`);
      }

      // Reload content
      await loadContentData();
    } catch (err) {
      console.error(`Failed to ${action} content:`, err);
      setError(`Failed to ${action} content. Please try again.`);
    }
  };

  const handleUserAction = async (userId: string, action: 'verify' | 'suspend' | 'ban') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      // Reload users
      await loadContentData();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      setError(`Failed to ${action} user. Please try again.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'verified': return 'text-green-400';
      case 'pending': case 'reviewing': return 'text-yellow-400';
      case 'flagged': case 'under_review': return 'text-red-400';
      case 'suspended': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'verified': return CheckCircle;
      case 'pending': case 'reviewing': return AlertTriangle;
      case 'flagged': case 'under_review': return Flag;
      case 'suspended': return XCircle;
      default: return Eye;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
          <p className="text-gray-400">Moderate content, manage users, and maintain community standards</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Reported Content</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Flag className="w-4 h-4" />
              <span>{reportedContent.length} pending reports</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          ) : reportedContent.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No reported content to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportedContent.map((report) => (
              <div key={report.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        report.type === 'post' ? 'bg-blue-500/20 text-blue-300' :
                        report.type === 'space' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {report.type.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-sm">{report.timestamp}</span>
                      <span className="text-red-400 text-sm">{report.reportCount} reports</span>
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="text-white font-medium mb-2">Reported Content:</h3>
                      <p className="text-gray-300 bg-white/5 p-3 rounded-lg">{report.content}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Author:</span>
                        <span className="text-white ml-2">{report.author}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Reported by:</span>
                        <span className="text-white ml-2">{report.reporter}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Reason:</span>
                        <span className="text-yellow-300 ml-2">{report.reason}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleContentAction(report.id, 'approve')}
                      className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-lg 
                               hover:bg-green-500/30 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleContentAction(report.id, 'remove')}
                      className="px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-lg 
                               hover:bg-red-500/30 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                    <button
                      onClick={() => handleContentAction(report.id, 'flag')}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-300 text-sm rounded-lg 
                               hover:bg-yellow-500/30 transition-colors flex items-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Flag</span>
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">User Management</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors">
                Export Data
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-400">
                <div>User</div>
                <div>Status</div>
                <div>Join Date</div>
                <div>Posts</div>
                <div>Followers</div>
                <div>Reports</div>
                <div>Last Active</div>
                <div>Actions</div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userStats.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No user data available</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {userStats.map((user) => {
                const StatusIcon = getStatusIcon(user.status);
                return (
                  <div key={user.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="grid grid-cols-8 gap-4 items-center">
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.username}</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(user.status)}`} />
                        <span className={`text-sm capitalize ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300">{user.joinDate}</div>
                      <div className="text-sm text-white">{user.posts}</div>
                      <div className="text-sm text-white">{formatNumber(user.followers)}</div>
                      <div className={`text-sm ${user.reports > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {user.reports}
                      </div>
                      <div className="text-sm text-gray-400">{user.lastActive}</div>
                      
                      <div className="flex items-center space-x-1">
                        {user.status !== 'verified' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'verify')}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Verify user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Suspend user"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'ban')}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Ban user"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'spaces' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Space Management</h2>
            <button className="px-4 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-lg hover:bg-purple-500/30 transition-colors">
              Create Featured Space
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : spaceStats.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No space data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {spaceStats.map((space) => {
              const StatusIcon = getStatusIcon(space.status);
              return (
                <div key={space.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 
                                    rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {space.name.split(' ').map((word: string) => word[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{space.name}</h3>
                        <p className="text-sm text-gray-400">Created by {space.creator} • {space.created}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{formatNumber(space.members)}</div>
                        <div className="text-xs text-gray-400">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">{formatNumber(space.posts)}</div>
                        <div className="text-xs text-gray-400">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-bold ${space.reports > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {space.reports}
                        </div>
                        <div className="text-xs text-gray-400">Reports</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(space.status)}`} />
                        <span className={`text-sm capitalize ${getStatusColor(space.status)}`}>
                          {space.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Platform Announcements</h2>
            <button className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center space-x-2">
              <Megaphone className="w-4 h-4" />
              <span>New Announcement</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        announcement.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {announcement.status}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{announcement.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Created {announcement.created}</span>
                      <span>•</span>
                      <span>{formatNumber(announcement.views)} views</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-blue-500/20 text-blue-300 text-sm rounded-lg hover:bg-blue-500/30 transition-colors">
                      Edit
                    </button>
                    {announcement.status === 'draft' && (
                      <button className="px-3 py-1.5 bg-green-500/20 text-green-300 text-sm rounded-lg hover:bg-green-500/30 transition-colors">
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}