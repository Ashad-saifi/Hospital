import React from 'react';
import { Calendar, Award, Star } from 'lucide-react';
import aishaRahmanImg from '../assets/aisha_rahman.png';

/**
 * Reusable DoctorCard Component
 * 
 * Concept Explanations:
 * 1. Props: This component accepts `image`, `name`, `specialty`, `experience`, and `onBook` as variables (props)
 *    which makes it a reusable template. We can render multiple doctors by feeding different values.
 */
const DoctorCard = ({ image, name, specialty, experience, rating, onBook }) => {
  return (
    <div className="doctor-card">
      {/* Doctor Image & Specialty Badge */}
      <div className="doctor-card-media">
        <img src={image} alt={name} className="doctor-img" />
        <span className="doctor-specialty-badge">{specialty}</span>
      </div>

      {/* Doctor Info */}
      <div className="doctor-card-content">
        <div className="doctor-rating-row">
          <div className="doctor-rating">
            <Star className="star-icon" size={14} />
            <span>{rating} (120+ Reviews)</span>
          </div>
          <div className="doctor-exp">
            <Award size={14} className="award-icon" />
            <span>{experience} Exp</span>
          </div>
        </div>

        <h3 className="doctor-name">{name}</h3>
        <p className="doctor-description">
          Specialized clinical practitioner offering consulting, comprehensive treatments, and wellness care.
        </p>

        {/* CTA Button */}
        <button className="btn btn-outline btn-sm w-full doctor-btn" onClick={onBook}>
          <Calendar size={16} />
          Book Appointment
        </button>
      </div>
    </div>
  );
};

/**
 * Main Doctors Component
 * 
 * Concept Explanations:
 * 1. Props Passing: Maps doctors array data to individual <DoctorCard /> instances.
 * 2. Callback Props: Passes the parent trigger function `onOpenAppointment` down to DoctorCard as `onBook`.
 */
const Doctors = ({ onOpenAppointment, doctorsList = [] }) => {
  // Static Doctors fallback list
  const staticDoctorsList = [
    {
      id: "doc-1",
      name: "Dr. Priya Sharma",
      specialty: "Cardiologist",
      experience: "12 Years",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "doc-2",
      name: "Dr. Rajesh Iyer",
      specialty: "Neurologist",
      experience: "15 Years",
      rating: "5.0",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "doc-3",
      name: "Dr. Amit Patel",
      specialty: "Orthopedic Surgeon",
      experience: "14 Years",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "doc-4",
      name: "Dr. Aisha Rahman",
      specialty: "Pediatrician",
      experience: "10 Years",
      rating: "4.8",
      image: aishaRahmanImg
    }
  ];

  // Map backend doctor properties if available
  const displayDoctors = doctorsList.length > 0 
    ? doctorsList.map(doc => ({
        id: doc._id || doc.id,
        name: doc.name,
        specialty: doc.specialty,
        experience: doc.exp || doc.experience || "10 Years",
        rating: doc.rating || "4.9",
        image: doc.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
        raw: doc
      }))
    : staticDoctorsList;

  return (
    <section id="doctors" className="doctors-section section-padding">
      <div className="container">

        {/* Section Heading */}
        <div className="section-title-wrapper text-center">
          <span className="section-subtitle">Meet Our Staff</span>
          <h2 className="section-title">Our Qualified Specialists</h2>
          <div className="title-bar center"></div>
          <p className="section-description">
            Our clinical departments are led by top practitioners and specialists who maintain international board certifications and extensive research experience.
          </p>
        </div>

        {/* Doctors Card Grid */}
        <div className="doctors-grid">
          {displayDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              name={doctor.name}
              specialty={doctor.specialty}
              experience={doctor.experience}
              rating={doctor.rating}
              image={doctor.image}
              onBook={() => onOpenAppointment(doctor.raw || doctor)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Doctors;
