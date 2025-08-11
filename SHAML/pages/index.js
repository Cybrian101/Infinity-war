import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import ThemeToggle from '../components/ThemeToggle'
import { 
  User, 
  Users, 
  Shield, 
  FileText, 
  Upload, 
  Brain, 
  BarChart3,
  ArrowRight,
  Globe,
  Trophy,
  Target,
  Settings,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Matching',
      description: 'Advanced machine learning algorithms for precise candidate-job matching'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards providing deep insights into recruitment metrics'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Reach',
      description: 'Connect with talent worldwide through our expansive network'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Quality Assurance',
      description: 'Rigorous verification processes ensuring top-tier candidate quality'
    }
  ]

  const userRoles = [
    {
      role: 'job-seeker',
      title: 'Job Seeker',
      description: 'Discover your next career opportunity with AI-powered precision matching.',
      features: ['AI Job Matching', 'Resume Builder', 'Real-time Tracking', 'Career Insights'],
      color: 'from-blue-500 to-blue-600',
      icon: <User className="w-8 h-8" />,
      href: '/candidate/login'
    },
    {
      role: 'recruiter',
      title: 'AR Recruiter',
      description: 'Transform recruitment with intelligent automation and insights.',
      features: ['AI Intelligence', 'Candidate Sourcing', 'Progress Tracking', 'Email Automation'],
      color: 'from-green-500 to-green-600',
      icon: <Target className="w-8 h-8" />,
      href: '/recruiter/login'
    },
    {
      role: 'admin',
      title: 'System Admin',
      description: 'Complete platform control with advanced analytics and reporting.',
      features: ['Advanced Analytics', 'Custom Dashboards', 'User Management', 'Custom Reports'],
      color: 'from-purple-500 to-purple-600',
      icon: <Shield className="w-8 h-8" />,
      href: '/admin/login'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '25K+', label: 'Jobs Posted' },
    { number: '95%', label: 'Match Accuracy' },
    { number: '500+', label: 'Companies' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            HireWise
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Revolutionizing Recruitment with <span className="text-blue-600 dark:text-blue-400 font-semibold">AI Intelligence</span>
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Experience the future of hiring with our advanced AI-powered platform that connects the right talent with the right opportunities, streamlining recruitment for everyone.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.button
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              onClick={() => router.push('/candidate/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Find Your Dream Job
            </motion.button>
            <motion.button
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
              onClick={() => router.push('/recruiter/login')}
              className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start Recruiting
            </motion.button>
          </div>

          {/* Statistics */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </header>

      {/* Choose Your Path Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Whether you're seeking talent or opportunities, HireWise provides tailored solutions for every user type.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {userRoles.map((role, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              className="relative group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 h-full hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${role.color} text-white mb-4`}>
                    {role.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {role.description}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => router.push(role.href)}
                  className={`w-full bg-gradient-to-r ${role.color} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105`}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Powered by Innovation Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Powered by Innovation
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our cutting-edge features are designed to transform how you approach recruitment and job searching.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Hiring Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of companies and professionals who have revolutionized their recruitment process with HireWise.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                onClick={() => router.push('/candidate/login')}
                className="bg-white text-blue-900 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Start Job Search
              </motion.button>
              <motion.button
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                onClick={() => router.push('/recruiter/login')}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Post Jobs Now
              </motion.button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-blue-200 text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">HireWise</h3>
              <p className="text-gray-400 mb-6">
                Revolutionizing recruitment with AI-powered matching, real-time analytics, and seamless user experiences for candidates, recruiters, and administrators.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">For Candidates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Recruiters</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 HireWise by Hirewise Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 