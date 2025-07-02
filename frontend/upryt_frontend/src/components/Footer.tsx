import { Facebook, Instagram, Twitter } from 'lucide-react';
import UprytLogo from '../assets/uprytblue.png';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700 text-sm mt-10">
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
  
  {/* Branding block spans 2 columns on medium screens and above */}
  <div className="md:col-span-2 flex flex-col items-start space-y-2">
    <div className="text-lg font-semibold"><img src={UprytLogo} alt="" className="w-20 h-auto"/></div>
    <div className="text-sm text-gray-500">Align your posture. Elevate your life.</div>
    <div className="flex space-x-4 mt-2">
      <Facebook className="w-5 h-5 cursor-pointer text-gray-500 hover:text-blue-700" />
      <Twitter className="w-5 h-5 cursor-pointer text-gray-500 hover:text-blue-700" />
      <Instagram className="w-5 h-5 cursor-pointer text-gray-500 hover:text-blue-700" />
    </div>
  </div>

  {/* Content sections */}
  <div>
    <h4 className="font-semibold text-sm mb-2">ABOUT</h4>
    <ul className="space-y-1">
      <li>Our Mission</li>
      <li>How It Works</li>
      <li>Meet the Team</li>
    </ul>
  </div>

  <div>
    <h4 className="font-semibold text-sm mb-2">BLOG</h4>
    <ul className="space-y-1">
      <li>Blog</li>
      <li>Posture Tips</li>
      <li>Wellness Insights</li>
      <li>Support</li>
    </ul>
  </div>

  <div>
    <h4 className="font-semibold text-sm mb-2">PRODUCTS</h4>
    <ul className="space-y-1">
      <li>Upryt App</li>
      <li>Upryt Device</li>
      <li>Upryt Cloud</li>
      <li>Posture AI</li>
    </ul>
  </div>
</div>


      <div className="border-t border-gray-200 pt-4 pb-6 text-center text-xs text-gray-500">
        <div>Upryt Technologies Pvt. Ltd.  
        Kathmandu, Nepal</div>
        <div className="mt-1">© 2025 Upryt. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
