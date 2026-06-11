import React from 'react';
import { 
  Heart, 
  Brain, 
  Smile, 
  Activity, 
  Bone, 
  PhoneCall, 
  ScanHeart 
} from 'lucide-react';

/**
 * Services Component
 * 
 * Concept Explanations:
 * 1. Mapped Arrays: Holds dynamic data in a clean array of objects (`servicesData`).
 * 2. map() Function: Iterates over the array and yields a JSX card structure for each service.
 * 3. React key Prop: Assigned unique values (`service.id`) so React can efficiently track and re-render list items.
 */
const Services = ({ onOpenAppointment }) => {
  // Service cards data array
  const servicesData = [
    {
      id: "ser-1",
      title: "Emergency Care",
      description: "24/7 immediate trauma and acute care response. Our emergency team is always prepared to save lives.",
      icon: PhoneCall,
      color: "red"
    },
    {
      id: "ser-2",
      title: "Cardiology",
      description: "Advanced cardiac profiling, electrocardiograms, heart surgeries, and recovery therapies.",
      icon: Heart,
      color: "blue"
    },
    {
      id: "ser-3",
      title: "Neurology",
      description: "Specialized treatment for brain, spine, and nervous system disorders using pioneering micro-therapies.",
      icon: Brain,
      color: "purple"
    },
    {
      id: "ser-4",
      title: "Dental Care",
      description: "Comprehensive dental services, orthodontics, oral hygiene, and cosmetic dental operations.",
      icon: Smile,
      color: "cyan"
    },
    {
      id: "ser-5",
      title: "ICU Departments",
      description: "Highly automated critical care units equipped with continuous clinical tracking and expert monitoring.",
      icon: Activity,
      color: "emerald"
    },
    {
      id: "ser-6",
      title: "Radiology & Imaging",
      description: "State-of-the-art diagnostic facilities including MRI scans, CT scans, and high-resolution X-Rays.",
      icon: ScanHeart,
      color: "sky"
    },
    {
      id: "ser-7",
      title: "Orthopedics",
      description: "Bone and joint injury rehabilitation, orthopedic surgeries, and sports physical therapy guidance.",
      icon: Bone,
      color: "orange"
    }
  ];

  return (
    <section id="services" className="services-section section-padding bg-muted">
      <div className="container">
        
        {/* Section Heading */}
        <div className="section-title-wrapper text-center">
          <span className="section-subtitle">Our Specializations</span>
          <h2 className="section-title">Medical Departments & Services</h2>
          <div className="title-bar center"></div>
          <p className="section-description">
            We provide a comprehensive range of clinical services backed by specialized doctors, cutting-edge medical systems, and a caring, expert nursing staff.
          </p>
        </div>

        {/* Services Grid Layout */}
        <div className="services-grid">
          {servicesData.map((service) => {
            // Assign the icon component to a capitalized variable name to render it as a JSX element
            const IconComponent = service.icon;
            
            return (
              <div className="service-card" key={service.id}>
                {/* Decorative background element for hover shine */}
                <div className="card-shine"></div>
                
                <div className={`service-icon-wrapper color-${service.color}`}>
                  <IconComponent className="service-icon" size={28} />
                </div>
                
                <h3 className="service-title">{service.title}</h3>
                
                <p className="service-description-text">
                  {service.description}
                </p>
                
                <button className="service-link">
                  Read More &rarr;
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Button to Book Appointment */}
        <div className="services-action text-center" style={{ marginTop: '40px' }}>
          <button onClick={onOpenAppointment} className="btn btn-primary">
            Book Appointment
          </button>
        </div>

      </div>
    </section>
  );
};

export default Services;
