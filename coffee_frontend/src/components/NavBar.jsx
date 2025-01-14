


const NavBar = () => {
    return (
    <nav className="bg-black bg-opacity-95 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <div className="text-amber-600 text-2xl font-bold">
            ☕ Coffee Haven
            </div>
            <div className="flex space-x-6">
                <a href="#" className="text-white hover:text-amber-600">Home</a>
                <a href="#" className="text-white hover:text-amber-600">About</a>
                <a href="#" className="text-white hover:text-amber-600">Shop</a>
                <a href="#" className="text-white hover:text-amber-600">Contact</a>
            </div>
            <div className="flex space-x-4">
                <button className="text-amber-600 hover:text-amber-500">Login</button>
                <button className="px-4 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-500">
                    Sign Up
                </button>
            </div>
        </div> 
    </nav>
    )
}

export default NavBar