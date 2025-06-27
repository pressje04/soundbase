/* Component for the profile tabs including posts, likes, reviews, etc.

It is meant to be similar to twitter where users can view all of their activity 
on the app in 1 place.
*/

'use client';

import clsx from 'clsx';

const tabs: ('Posts' | 'Likes')[] = ['Posts', 'Likes'];

export default function ProfileTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: 'Posts' | 'Likes';
  setActiveTab: React.Dispatch<React.SetStateAction<'Posts' | 'Likes'>>;
}) {
  return (
    <div className="flex justify-around border-b border-gray-700 w-full mt-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={clsx(
            'py-3 text-sm font-semibold w-full',
            activeTab === tab ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
