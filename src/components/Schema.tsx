import React from 'react';

export const Schema = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Strategos",
    "url": "https://strategos.saifan.me/",
    "description": "A high-performance Game Theory Engine and Evolutionary Simulator for exploring social dynamics and strategy evolution.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "author": {
      "@type": "Person",
      "name": "Saifan Mohammad",
      "url": "https://github.com/SaifanX"
    },
    "featureList": [
      "Real-time evolutionary simulation",
      "Interactive Game Theory models",
      "Behavioral analysis of AI personas",
      "Multiplayer strategy rooms"
    ],
    "screenshot": "https://strategos.saifan.me/og-image.png",
    "softwareVersion": "1.0.0"
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Strategos Labs",
    "url": "https://strategos.saifan.me/",
    "logo": "https://strategos.saifan.me/favicon.png",
    "sameAs": [
      "https://github.com/SaifanX/Strategos"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Strategos",
    "alternateName": ["Strategos Conflict Engine", "Strategos Simulator"],
    "url": "https://strategos.saifan.me/"
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </>
  );
};
