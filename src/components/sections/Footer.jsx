import React from 'react';

/**
 * FOOTER SECTION
 * Contains navigation links and legal disclaimer
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { title: 'About', href: '#about' },
    { title: 'Contact', href: '#contact' },
    { title: 'Privacy Policy', href: '#privacy' },
    { title: 'Terms of Use', href: '#terms' },
    { title: 'Disclaimer', href: '#disclaimer' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Branding */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">BhoomiAI</h3>
            <p className="text-gray-400">
              AI-Powered Land Verification & Risk Intelligence Platform
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 mb-8">
            {footerLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {link.title}
              </a>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h4 className="text-white font-semibold mb-3">Legal Disclaimer</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                BhoomiAI provides advisory insights based on available records and AI analysis.
                Final purchase decisions should be taken in consultation with legal professionals.
                We do not guarantee the accuracy of third-party government records and recommend
                independent verification before any transaction.
              </p>
            </div>

            {/* Copyright */}
            <div className="text-center text-sm text-gray-500">
              <p>&copy; {currentYear} BhoomiAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
