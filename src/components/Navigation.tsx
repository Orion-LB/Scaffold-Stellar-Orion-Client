import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#integrations" },
    { name: "Pricing", href: "#pricing" },
    { name: "Changelog", href: "#reviews" },
    { name: "Contact", href: "#faqs" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-card/80 border-b border-border transition-all duration-300 ease-in-out ${
      isScrolled ? 'py-2' : 'py-4'
    }`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between">
          <a href="#hero" className="font-antic text-2xl font-italic text-foreground transition-all duration-300 ease-in-out">
            Orion
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-inter text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
            <Button 
              variant="default" 
              size="sm"
              className="btn-gradient text-white rounded-[10px] font-inter font-medium transition-all duration-300 ease-in-out"
            >
               AppLaunch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in-up">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-inter text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Button 
              variant="default"
              className="btn-gradient text-white rounded-[10px] font-inter font-medium w-full"
            >
               ApLaunchp
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;