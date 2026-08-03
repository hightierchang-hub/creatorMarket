import React from 'react'

const Title = ({title, description}) => {
  return (
    <div className='flex flex-col items-center mb-8'>
        <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-100'> {title} </h3>
        <p className='text-slate-600 dark:text-slate-400 max-w-500px'> {description} </p>

    </div>
  )
}

export default Title