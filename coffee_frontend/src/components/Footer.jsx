import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black bg-opacity-95 text-white py-8 px-4">
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center">
                {/* Logo and Quick Links */}
                <div className="flex flex-col items-center md:items-start space-y-4 mb-8 md:mb-0">
                    <h1 className="text-3xl font-bold">☕ Coffee Haven</h1>
                    <div className="flex space-x-6">
                        <a href="/about" className="hover:text-gray-400">About</a>
                        <a href="/contact" className="hover:text-gray-400">Services</a>
                        <a href="/contact" className="hover:text-gray-400">Contact</a>
                    </div>
                </div>

                {/* Social Media Links */}
                <div className="flex space-x-6 mb-8 md:mb-0">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-6 h-6 text-white hover:text-gray-400 transition-colors" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <Facebook className="w-6 h-6 text-white hover:text-gray-400 transition-colors" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-6 h-6 text-white hover:text-gray-400 transition-colors" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-6 h-6 text-white hover:text-gray-400 transition-colors" />
                    </a>
                </div>
            </div>

            {/* Footer Bottom Section */}
            <div className="border-t border-gray-700 mt-8 pt-4">
                <div className="max-w-screen-xl mx-auto text-center">
                    <p className="text-sm text-gray-400">
                        &copy; {currentYear} ☕ Coffee Haven All rights reserved. | 
                        <a href="/privacy" className="hover:text-gray-400 ml-2">Privacy Policy</a> |
                        <a href="/terms" className="hover:text-gray-400 ml-2">Terms of Service</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
