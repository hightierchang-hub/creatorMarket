const AdminTitle = ({ text1, text2 }) => {
    return (
        <h1 className='font-medium text-xl text-gray-700 dark:text-gray-300'>
            {text1} <span className="underline underline-offset-2 text-indigo-500">{text2}</span>
        </h1>
    )
}

export default AdminTitle