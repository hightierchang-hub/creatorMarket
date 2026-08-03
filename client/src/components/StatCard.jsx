import React from 'react'

const StatCard = ({title,value, icon, color}) => {
    const colorMap = {
        indigo: 'bg-indigo-100 dark:bg-indigo-500/15',
        green: 'bg-green-100 dark:bg-green-500/15',
        yellow: 'bg-yellow-100 dark:bg-yellow-500/15',
    }
  return (
    <div className='bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6'>
        <div className='flex items-center justify-between'>
            <div>
                <p className='text-sm font-medium  text-gray-600 dark:text-gray-400'>{title}</p>
                 <p className='text-2xl font-bold  text-gray-800 dark:text-gray-100'>{value}</p>
            </div>
            <div className={`size-12 ${colorMap[color]} rounded-full flex items-center justify-center`}>{icon}</div>
        </div>
    </div>

)
}

export default StatCard