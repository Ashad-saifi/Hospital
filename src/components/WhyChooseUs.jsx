import React from 'react';
import { ShieldCheck, Activity, Users, Clock, ClipboardCheck, Monitor } from 'lucide-react';

/**
 * WhyChooseUs Component
 * 
 * Concept Explanations:
 * 1. Modular Structures: Creates small, well-defined content blocks to list competitive benefits.
 * 2. Visual Hierarchy: Utilizes styled cards with bold text and side-by-side grids.
 */
const WhyChooseUs = () => {
  const points = [
    {
      icon: Clock,
      title: "24/7 Emergency Support",
      description: "Our ER is fully staffed round the clock. We are ready to provide instant critical and emergency treatment at any hour."
    },
    {
      icon: ClipboardCheck,
      title: "Fast & Accurate Reports",
      description: "Integrated digital diagnostic systems enable ultra-fast laboratory reports, helping doctors start treatment faster."
    },
    {
      icon: Users,
      title: "Highly Experienced Doctors",
      description: "Our roster includes internationally accredited board-certified surgeons and clinicians with decades of combined practice."
    },
    {
      icon: Monitor,
      title: "Advanced Medical Equipment",
      description: "We invest heavily in the latest robotic surgical systems, MRI imaging scanners, and automated ICU ventilators."
    },
    {
      icon: ShieldCheck,
      title: "Easy Online Appointments",
      description: "Book consults, check test results, and contact specialists directly via our secure, simple portal."
    }
  ];

  return (
    <section id="why-choose-us" className="why-choose-section section-padding">
      <div className="container why-choose-container">
        
        {/* Left column: Key headline message */}
        <div className="why-choose-headline">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Our Advantage</span>
            <h2 className="section-title">Why Patients Trust MedCare</h2>
            <div className="title-bar"></div>
          </div>
          
          <p className="headline-lead-text">
            At MedCare, we combine medical expertise with patient-first values to offer top-tier healthcare services.
          </p>
          
          <p className="headline-body-text">
            We understand that hospital visits can be stressful. That is why we provide clean, welcoming environments, transparent billing, and clinical teams that treat you like family.
          </p>

          <div className="why-choose-badge-grid">
            <div className="advantage-badge">
              <Activity className="badge-icon" size={20} />
              <span>ISO 9001:2015 Certified</span>
            </div>
            <div className="advantage-badge">
              <Activity className="badge-icon" size={20} />
              <span>Award-Winning Clinic</span>
            </div>
          </div>
        </div>

        {/* Right column: The grid of advantages */}
        <div className="why-choose-grid">
          {points.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <div className="advantage-card" key={index}>
                <div className="advantage-icon-wrapper">
                  <IconComponent size={24} />
                </div>
                <div className="advantage-info">
                  <h4 className="advantage-card-title">{point.title}</h4>
                  <p className="advantage-card-desc">{point.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
