"use client"

import { motion } from "framer-motion"
import { Big_Shoulders_Display } from "next/font/google"
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram } from "lucide-react"
import Link from "next/link"
const bigShoulders = Big_Shoulders_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

export const Footer = () => {
  const currentYear = new Date().getFullYear()
 
  return (
    <footer className="bg-black text-white mt-24">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className={`${bigShoulders.className} text-3xl font-bold text-white`}>
                Off* <span className="text-[#ea3a59]">Radar</span>
              </h3>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Building the future with cutting-edge technology and innovative solutions for modern development.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#ea3a59]" />
                <span className="text-gray-300">comingsoon</span>
              </div>
              <div className="flex items-center gap-3">
              
                <span className="text-gray-300"></span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#ea3a59]" />
                <span className="text-gray-300">Hyderabad , Telangana</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            <h4 className={`${bigShoulders.className} text-xl font-bold text-[#ea3a59]`}>Quick Links</h4>
            <ul className="space-y-3">
              
                <li >
                  <Link href="/about"
                   
                    className="text-gray-300 hover:text-[#ea3a59] transition-colors duration-300 hover:underline"
                  >
                   About
                  </Link>
                  
                 
                </li>
                <li>
                   <Link href="/contact"
                   
                    className="text-gray-300 hover:text-[#ea3a59] transition-colors duration-300 hover:underline"
                  >
                   Contact
                  </Link>
                </li>
              
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <h4 className={`${bigShoulders.className} text-xl font-bold text-[#ea3a59]`}>Services</h4>
            <ul className="space-y-3">
              {["AI integration","Privacy protection","Secure enviroments","Multi Modal Support","Multi LLM"].map(
                (service) => (
                  <li key={service}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-[#ea3a59] transition-colors duration-300 hover:underline"
                    >
                      {service}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            <h4 className={`${bigShoulders.className} text-xl font-bold text-[#ea3a59]`}>Stay Updated</h4>
            <p className="text-gray-400">Please visit the website for regular updates</p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                
               
              </div>
            </div>

            {/* Social Media */}
            
            
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="border-t border-gray-800"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              © {currentYear} <span className="text-[#ea3a59] font-semibold">Off* radar</span>. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-6 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                <a key={link} href="#" className="text-gray-400 hover:text-[#ea3a59] transition-colors duration-300">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
    </footer>
  )
}
