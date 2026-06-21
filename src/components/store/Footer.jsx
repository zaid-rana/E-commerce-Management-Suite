import React from 'react'
import { Phone, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">
                SPHE
                <span className="text-[#8B5CF6]">R</span>
                <span className="inline-block w-2 h-2 bg-[#8B5CF6] rounded-sm ml-0.5"></span>
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Products Digital
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/payment" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Return & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <a href="tel:+11234567890" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  (+1) 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <a href="mailto:email@yourdomain.com" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  email@yourdomain.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer
