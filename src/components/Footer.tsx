import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import cloudImage from "@/assets/cloud.png";

const Footer = () => {
  const footerLinks = {
    Product: ["Features", "Pricing", "Security", "Roadmap", "Integrations"],
    Company: ["About", "Blog", "Careers", "Press", "Partners"],
    Resources: ["Documentation", "Help Center", "Community", "Contact", "Status"],
    Legal: ["Privacy", "Terms", "Cookie Policy", "Licenses", "Compliance"]
  };

  return (
    <footer id="footer" className="border-t border-border divider-dotted bg-card/50 relative overflow-hidden">
      {/* Subtle cloud background */}
      <div className="absolute bottom-0 left-0 pointer-events-none opacity-10 transform -translate-x-1/4 translate-y-1/3">
        <img 
          src={cloudImage} 
          alt=""
          className="w-[400px] mix-blend-soft-light"
        />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="font-antic text-2xl font-italic text-foreground mb-4">
              Orion
            </h3>
            <p className="font-inter text-sm text-foreground/70 mb-6">
              Transform your business with AI-powered solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-jakarta font-semibold text-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="font-inter text-sm text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border divider-dotted pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-inter text-sm text-foreground/60">
              © 2025 Orion. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="font-inter text-sm text-foreground/60 hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="font-inter text-sm text-foreground/60 hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="font-inter text-sm text-foreground/60 hover:text-foreground transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;