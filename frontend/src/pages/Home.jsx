import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Particles from '../components/Particles';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState([]);

  const heroImages = [
    'bg-gradient-to-br from-blue-600 to-blue-800',
    'bg-gradient-to-br from-indigo-600 to-purple-800',
    'bg-gradient-to-br from-cyan-500 to-blue-600'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="pt-20 bg-white">
      {/* Hero Section with Carousel */}
      <section className={`min-h-screen flex items-center justify-center ${heroImages[currentSlide]} transition-all duration-1000 relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <Particles color={'rgba(255,255,255,0.9)'} />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, linear: true }}
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white opacity-10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, linear: true }}
            className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white opacity-5"
          />
        </div>

        <div className="container-main relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div {...fadeInUp} className="text-white">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 md:mb-6">
                Transform Your Learning Journey
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8">
                Learn from expert teachers, master new skills, and achieve your goals with quality education at your pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="px-6 md:px-8 py-3 md:py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transition-all duration-200 shadow-premium hover:shadow-lift text-center"
                >
                  Browse Free Courses
                </Link>
                <Link
                  to="/register"
                  className="px-6 md:px-8 py-3 md:py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-200 text-center"
                >
                  Become a Teacher
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block relative"
            >
              <div className="relative">
                {/* Image carousel placeholder */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-full h-96 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-4xl font-bold text-blue-600 opacity-90"
                >
                  📚
                </motion.div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-yellow-400 rounded-2xl shadow-lg opacity-70"></div>
              </div>
            </motion.div>
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center gap-2 mt-8 md:mt-12">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-gray-900">
            Why Choose Cock Syllabi?
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: '👨‍🏫', title: 'Expert Teachers', desc: 'Verified professionals with real-world experience' },
              { icon: '📚', title: 'Quality Content', desc: 'Curated courses by educational experts' },
              { icon: '⏰', title: 'Flexible Learning', desc: 'Learn at your own pace, lifetime access' },
              { icon: '✅', title: 'Certificates', desc: 'Earn recognized completion certificates' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 text-center hover:shadow-premium rounded-xl transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Courses Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Start Learning for FREE
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Access high-quality free courses across all subjects. No credit card required.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { subject: 'Mathematics', level: '10', price: 'FREE', icon: '📐' },
              { subject: 'English', level: '10', price: 'FREE', icon: '📖' },
              { subject: 'Science', level: '10', price: 'FREE', icon: '🔬' },
              { subject: 'History', level: '9', price: 'FREE', icon: '📜' },
              { subject: 'Computer Science', level: '10', price: 'FREE', icon: '💻' },
              { subject: 'Languages', level: '10', price: 'FREE', icon: '🌐' }
            ].map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white rounded-xl shadow-premium hover:shadow-lift transition-all duration-300"
              >
                <div className="text-5xl mb-4">{course.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.subject}</h3>
                <p className="text-sm text-gray-600 mb-4">Class {course.level}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{course.price}</span>
                  <Link
                    to="/courses"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 shadow-premium hover:shadow-lift"
            >
              Browse All Free Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* Zoom Consultation Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get Expert Consultation via Zoom
              </h2>
              <p className="text-lg text-blue-100 mb-6">
                Schedule 1-on-1 video consultations with expert teachers. Get personalized guidance, answer your questions, and clear your doubts.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  '📹 Live Video Consultation with Teachers',
                  '⏱️ Flexible Scheduling (30-60 minutes)',
                  '❓ Personalized Q&A Sessions',
                  '📋 Course Planning & Guidance'
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-blue-100">
                    <span className="mr-3">{item.split(' ')[0]}</span>
                    <span>{item.substring(item.indexOf(' ') + 1)}</span>
                  </li>
                ))}
              </ul>
              <button className="px-8 py-4 bg-yellow-400 text-blue-600 rounded-lg font-bold hover:bg-yellow-300 transition-all duration-200 shadow-premium">
                Schedule Consultation
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="hidden md:flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-64 h-64 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <div className="text-7xl">🎥</div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, linear: true }}
                  className="absolute inset-0 border-2 border-transparent border-t-yellow-400 border-r-yellow-400 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            About Cock Syllabi
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                number: '10,000+',
                label: 'Active Students',
                icon: '👥'
              },
              {
                number: '500+',
                label: 'Expert Teachers',
                icon: '👨‍🎓'
              },
              {
                number: '1000+',
                label: 'Quality Courses',
                icon: '📚'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 text-center bg-gradient-to-br from-blue-50 to-yellow-50 rounded-xl hover:shadow-premium transition-all"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Cock Syllabi is a professional online learning platform dedicated to making quality education accessible to everyone. 
            We connect passionate teachers with eager learners, creating a vibrant community where knowledge flourishes. 
            From K-12 subjects to professional development, our carefully curated courses and expert instructors ensure you achieve your learning goals.
          </p>
        </div>
      </section>

      {/* Follow Us Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Follow Our Learning Community
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Stay updated with new courses, educational tips, and inspiring student success stories.
          </p>

          <div className="flex justify-center gap-6 flex-wrap mb-12">
            {[
              { icon: '📘', name: 'Facebook', color: 'bg-blue-600', url: '#' },
              { icon: '𝕏', name: 'Twitter', color: 'bg-gray-800', url: '#' },
              { icon: '📷', name: 'Instagram', color: 'bg-pink-600', url: '#' },
              { icon: '▶️', name: 'YouTube', color: 'bg-red-600', url: '#' },
              { icon: '💼', name: 'LinkedIn', color: 'bg-blue-700', url: '#' }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`w-16 h-16 ${social.color} rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 shadow-premium hover:shadow-lift`}
                title={social.name}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-premium max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Subscribe to Our Newsletter</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container-main text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful students learning from expert teachers on Cock Syllabi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? '/courses' : '/login'}
              className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transition-all duration-200 shadow-premium hover:shadow-lift text-center"
            >
              Start Learning Now
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-purple-600 transition-all duration-200 text-center"
            >
              Become an Instructor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400 text-center border-t border-gray-800">
        <div className="container-main">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-left text-sm">
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Browse Courses</a></li>
                <li><a href="#" className="hover:text-white transition">Become Teacher</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center">© 2024 Cock Syllabi. All rights reserved. Made with ❤️ for learners.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
