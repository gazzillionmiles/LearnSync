import { useQuery } from "@tanstack/react-query";
import { LeaderboardEntry } from "@shared/types";

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  const currentUserId = 1; // Using a fixed user ID for the demo

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 md:p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercises Completed</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <tr 
                  key={entry.userId}
                  className={entry.userId === currentUserId ? 'bg-primary-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index < 3 ? (
                      <div className="flex items-center">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-400' : 
                            index === 1 ? 'bg-gray-400' : 
                            'bg-amber-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <span className="text-gray-500 font-medium text-lg">
                          {entry.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{entry.username}</div>
                        {entry.userId === currentUserId && (
                          <div className="text-xs text-primary font-medium">You</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{entry.completedExercises}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
