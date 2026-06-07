import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Globe,
  Send,
  Heart,
  ChevronRight
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { icon: Mail, text: "Contact", href: "#" },
    { icon: Globe, text: "Website", href: "https://www.mkau.edu.et/" },
    { icon: Send, text: "Telegram", href: "https://t.me/mekdelauniversity" },
    { icon: Facebook, text: "Facebook", href: "https://www.facebook.com/Mekdela.Amba.University/" },
  ];

  return (
    <footer className="footer">
      {/* Main Content */}
      <div className="footer-container">
        
        {/* Brand - Compact */}
        <div className="footer-block">
          <div className="brand-mini">
            <img
              src="/images/MAU.jpg"
              alt="MAU"
              className="brand-icon"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/32x32/3b82f6/ffffff?text=M";
              }}
            />
            <div>
              <h3 className="brand-mini-title">Mekdela Amba University</h3>
              <p className="brand-mini-sub">online clearances Systems</p>
            </div>
          </div>
        </div>

        {/* Quick Links - Compact */}
        <div className="footer-block">
          <h4 className="block-title">Quick Links</h4>
          <div className="mini-links">
            {quickLinks.map((link, index) => (
              <a key={index} href={link.href} className="mini-link" target="_blank" rel="noopener">
                <link.icon size={12} />
                <span>{link.text}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Contact - Compact */}
        <div className="footer-block">
          <h4 className="block-title">Contact</h4>
          <div className="mini-contact">
            <div className="mini-contact-item">
              <Mail size={12} />
              <a href="mailto:info@mau.edu.et">info@mau.edu.et</a>
            </div>
            <div className="mini-contact-item">
              <Phone size={12} />
              <a href="tel:+251921459991">+251 921 459 991</a>
            </div>
            <div className="mini-contact-item address">
              <MapPin size={12} />
              <span>Tulu Awulia, Ethiopia</span>
            </div>
          </div>
        </div>

        {/* Copyright - Compact */}
        <div className="footer-block copyright-block">
          <p className="copyright-text">
            © {currentYear} Lulieelyas
          </p>
          <p className="powered-mini">
            Made with <Heart size={10} className="heart-mini" />
          </p>
        </div>

      </div>
    </footer>
  );
}