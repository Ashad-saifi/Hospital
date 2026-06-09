import React from 'react';
import { Star, Quote } from 'lucide-react';

/**
 * Testimonials Component
 * 
 * Concept Explanations:
 * 1. Social Proof: Employs patient reviews to build trust.
 * 2. Nested Mapping: Loops through rating numbers to draw matching star icons dynamically.
 */
const Testimonials = () => {
  const testimonials = [
    {
      id: "test-1",
      name: "Robert Miller",
      role: "Orthopedic Patient",
      review: "The care and attention I received at MedCare was outstanding. The clinical surgical staff were highly supportive, explaining my rehabilitation schedule in full detail. Excellent support!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: "test-2",
      name: "Emily Watson",
      role: "Cardiology Patient",
      review: "I am incredibly grateful to the cardiology department. The emergency diagnostic and fast report retrieval helped us identify the heart blockage immediately. Dr. Jenkins is an absolute life-saver.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: "test-3",
      name: "James Chen",
      role: "General Checkup",
      review: "The online booking process is incredibly simple. I walked in, got my radiology scan done within 15 minutes, and accessed my prescription directly on the client portal. Highly recommend MedCare!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
    }
  ];

  return (
    <section id="testimonials" className="testimonials-section section-padding bg-muted">
      <div className="container">
        
        {/* Section Heading */}
        <div className="section-title-wrapper text-center">
          <span className="section-subtitle">Patient Feedback</span>
          <h2 className="section-title">What Our Patients Say</h2>
          <div className="title-bar center"></div>
          <p className="section-description">
            Read real feedback and success stories shared by patients who received treatments and surgeries at our healthcare center.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.id}>
              {/* Quote Mark Decoration */}
              <div className="quote-icon-wrapper">
                <Quote size={20} className="quote-icon" />
              </div>

              {/* Star Rating Rendering */}
              <div className="testimonial-stars">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} className="star-icon-filled" />
                ))}
              </div>

              {/* Patient Review Text */}
              <p className="testimonial-text">
                "{t.review}"
              </p>

              {/* Patient Profile Details */}
              <div className="patient-profile">
                <img src={t.image} alt={t.name} className="patient-img" />
                <div className="patient-info">
                  <h4 className="patient-name">{t.name}</h4>
                  <span className="patient-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
