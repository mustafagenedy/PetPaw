import axios from 'axios';
import React, { useEffect, useState } from 'react';

const petFacts = [
  "Dogs' noses are wet to help absorb scent chemicals!",
  "Cats have five toes on their front paws, but only four on the back!",
  "A group of kittens is called a kindle!",
  "Dogs can learn more than 1000 words!",
  "Cats sleep for 70% of their lives!",
  "A dog's sense of smell is 40x better than ours!",
  "Some cats can jump up to six times their length!",
  "Petting a dog or cat can lower your blood pressure!"
];

export default function Home() {
  const [gallery, setGallery] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [contactMsg, setContactMsg] = useState('');
  const [contactErr, setContactErr] = useState('');
  const [fact, setFact] = useState('');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    axios.get('/api/gallery').then(res => setGallery(Array.isArray(res.data) ? res.data : [])).catch(() => setGallery([]));
    setFact(petFacts[Math.floor(Math.random() * petFacts.length)]);
  }, []);

  const handleContactChange = e => setContact({ ...contact, [e.target.name]: e.target.value });
  const handleContactSubmit = async e => {
    e.preventDefault();
    setContactMsg(''); setContactErr('');
    if (!isLoggedIn) {
      setContactErr('You must be logged in to send a message.');
      return;
    }
    try {
      await axios.post('/api/contact', contact);
      setContactMsg('Message sent!');
      setContact({ name: '', email: '', message: '' });
    } catch (err) {
      setContactErr('Failed to send message');
    }
  };

  return (
    <div>
      {/* Hero Section with SVG wave and pet illustration */}
      <section className="py-5 text-center bg-primary text-white mb-5 rounded position-relative overflow-hidden hero-section">
        <svg viewBox="0 0 1440 320" className="hero-wave" style={{position:'absolute',bottom:0,left:0,width:'100%',zIndex:0}}><path fill="#fffbe7" fillOpacity="1" d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,197.3C672,192,768,128,864,128C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        <div className="container position-relative" style={{zIndex:1}}>
          <div className="d-flex flex-column align-items-center justify-content-center">
            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f436.png" alt="Dog" style={{width:64,marginRight:8}} />
            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f431.png" alt="Cat" style={{width:64,marginLeft:8}} />
          </div>
          <h1 className="display-4 fw-bold mt-3 animate-pop">Welcome to PetPaw Grooming</h1>
          <p className="lead animate-fadein hero-lead">
            <span className="hero-lead-bg">
              Professional grooming for your beloved pets. Book your appointment today!
            </span>
          </p>
          <a href="/booking" className="btn btn-light btn-lg mt-3 animate-bounce">Book Now</a>
        </div>
      </section>

      {/* Fun Pet Fact Section */}
      <section className="mb-5 text-center bg-light p-4 animate-fadein">
        <h4 className="mb-2">🐾 Did you know?</h4>
        <p className="fs-5 fw-bold">{fact}</p>
      </section>

      {/* Services Section with animated cards */}
      <section className="mb-5">
        <div className="container">
          <h2 className="mb-4 text-center">Our Services</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm animate-card">
                <div className="card-body text-center">
                  <span style={{fontSize:'2rem'}}>🛁</span>
                  <h5 className="card-title mt-2">Bath & Brush</h5>
                  <p className="card-text">Gentle bath, blow dry, and brushing for a shiny, healthy coat.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm animate-card" style={{animationDelay:'0.1s'}}>
                <div className="card-body text-center">
                  <span style={{fontSize:'2rem'}}>✂️</span>
                  <h5 className="card-title mt-2">Full Groom</h5>
                  <p className="card-text">Complete grooming including haircut, nail trim, and ear cleaning.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm animate-card" style={{animationDelay:'0.2s'}}>
                <div className="card-body text-center">
                  <span style={{fontSize:'2rem'}}>🐾</span>
                  <h5 className="card-title mt-2">Nail Trimming</h5>
                  <p className="card-text">Quick and safe nail trimming for dogs and cats.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with avatars and speech bubbles */}
      <section className="bg-light py-5 mb-5">
        <div className="container">
          <h2 className="mb-4 text-center">What Our Customers Say</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="testimonial animate-fadein">
                <div className="d-flex align-items-center mb-2">
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Sarah" className="rounded-circle me-2" style={{width:48,height:48,objectFit:'cover',border:'3px solid #ffb347'}} />
                  <h6 className="card-subtitle text-muted">Sarah L. <span style={{fontSize:'1.2rem'}}>🐶</span></h6>
                </div>
                <p className="card-text">"PetPaw always takes great care of my dog! Highly recommend."</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial animate-fadein" style={{animationDelay:'0.1s'}}>
                <div className="d-flex align-items-center mb-2">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Mike" className="rounded-circle me-2" style={{width:48,height:48,objectFit:'cover',border:'3px solid #ffb347'}} />
                  <h6 className="card-subtitle text-muted">Mike D. <span style={{fontSize:'1.2rem'}}>🐱</span></h6>
                </div>
                <p className="card-text">"Friendly staff and my cat looks amazing after every visit."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section with animated images */}
      <section className="mb-5">
        <div className="container">
          <h2 className="mb-4 text-center">Gallery</h2>
          <div className="row g-3 justify-content-center">
            {gallery.length === 0 && [1,2,3,4].map(i => (
              <div className="col-6 col-md-3" key={i}>
                <img src={`https://placedog.net/300/200?id=${i}`} alt={`Pet ${i}`} className="img-fluid rounded shadow-sm gallery-img animate-pop" />
              </div>
            ))}
            {gallery.map(img => (
              <div className="col-6 col-md-3" key={img._id}>
                <img src={img.url} alt={img.caption || 'Pet'} className="img-fluid rounded shadow-sm gallery-img animate-pop" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-primary text-white py-5 rounded animate-fadein">
        <div className="container">
          <h2 className="mb-4 text-center">Contact Us</h2>
          <div className="row justify-content-center">
            <div className="col-md-6">
              {contactMsg && <div className="alert alert-success">{contactMsg}</div>}
              {contactErr && <div className="alert alert-danger">{contactErr}</div>}
              <form onSubmit={handleContactSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input type="text" className="form-control" id="name" name="name" value={contact.name} onChange={handleContactChange} placeholder="Your Name" required disabled={!isLoggedIn} />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" name="email" value={contact.email} onChange={handleContactChange} placeholder="Your Email" required disabled={!isLoggedIn} />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea className="form-control" id="message" name="message" value={contact.message} onChange={handleContactChange} rows="3" placeholder="Your Message" required disabled={!isLoggedIn}></textarea>
                </div>
                <button type="submit" className="btn btn-light" disabled={!isLoggedIn}>Send Message</button>
                {!isLoggedIn && <div className="alert alert-warning mt-3">You must be logged in to send a message.</div>}
              </form>
              <div className="mt-4">
                <p className="mb-1"><strong>Email:</strong> info@petpaw.com</p>
                <p className="mb-1"><strong>Phone:</strong> (123) 456-7890</p>
                <p><strong>Address:</strong> 123 Pet Street, Cityville</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 