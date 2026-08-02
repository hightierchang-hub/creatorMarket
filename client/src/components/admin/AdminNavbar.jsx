import { Link } from "react-router-dom"
import { assets } from "../../assets/assets"

const AdminNavbar = () => {

    return (
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 h-16 border-b border-gray-200 bg-white">
            <Link to="/" className="inline-flex items-center">
                <img className="h-9 w-auto sm:h-10 md:h-12" src={assets.logo} alt="logo" />
            </Link>
        </div>
    )
}

export default AdminNavbar