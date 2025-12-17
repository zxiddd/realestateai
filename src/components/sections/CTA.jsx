import React from 'react';
import Button from '../Button';

/**
 * FINAL CTA SECTION
 * Strong call-to-action before footer
 */
const CTA = () => {
  return (
    <section className="bg-primary-700 section-padding">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Don't buy land blind.
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Get a complete verification report in days, not weeks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-700 hover:bg-gray-100 border-white"
            >
              Start Verification
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="bg-transparent text-white border-white hover:bg-primary-600"
            >
              Talk to an Expert
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
