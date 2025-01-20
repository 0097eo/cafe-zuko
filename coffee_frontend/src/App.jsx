import NavBar from "./components/NavBar"
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from "./pages/LandingPage"
import SignupPage from "./pages/Signup"
import LoginPage from "./pages/Login"
import Footer from "./components/Footer"
import ProductsPage from "./pages/Products"
import AboutPage from "./pages/About"
import ContactPage from "./pages/Contacts"
import UserDashboard from "./pages/Dashboard"
import Cart from "./components/Cart"

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/shop" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<UserDashboard />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App