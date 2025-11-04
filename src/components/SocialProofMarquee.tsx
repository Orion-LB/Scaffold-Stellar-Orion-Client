const SocialProofMarquee = () => {
  const partners = [
    "Google", "Microsoft", "Amazon", "Salesforce", "Adobe",
    "IBM", "Oracle", "SAP", "Cisco", "Intel"
  ];

  return (
    <section className="py-12 overflow-hidden border-y border-border divider-dotted">
      <div className="marquee-mask">
        <div className="flex gap-12 animate-marquee">
          {/* First set */}
          {partners.map((partner, i) => (
            <div key={`first-${i}`} className="flex-shrink-0 flex items-center justify-center px-8">
              <span className="font-jakarta text-xl font-semibold text-foreground/40 whitespace-nowrap">
                {partner}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {partners.map((partner, i) => (
            <div key={`second-${i}`} className="flex-shrink-0 flex items-center justify-center px-8">
              <span className="font-jakarta text-xl font-semibold text-foreground/40 whitespace-nowrap">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center mt-6 font-inter text-sm text-foreground/60">
        Trusted by leading companies worldwide
      </p>
    </section>
  );
};

export default SocialProofMarquee;