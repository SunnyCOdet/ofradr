"use client";

import React from "react";
import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

interface FooterLink {
  title: string;
  href: string;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: "Product",
    links: [
      { title: "Features", href: "#features" },
      { title: "Operating Modes", href: "#modes" },
      { title: "Privacy & Security", href: "/privacy" },
      { title: "Integration", href: "/" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "Changelog", href: "/changelog" },
      { title: "Docs", href: "/docs" },
      { title: "Help Center", href: "/help" },
      { title: "Status", href: "/status" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl bg-transparent px-6 py-10 lg:py-14">


      <div className="grid w-full gap-10 lg:gap-6 xl:grid-cols-3">
        {/* Brand / Info */}
        <AnimatedContainer className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/notlogo.png"
              alt="Off Radar Logo"
              width={32}
              height={32}
              className="select-none pointer-events-none"
            />
            <h3 className="text-2xl font-bold text-white">
              Off* <span className="text-[#ea3a59]">Radar</span>
            </h3>
          </div>

          <p className="text-sm text-muted-foreground max-w-sm">
            Off* Radar is an off-screen AI coding companion for safe, secure,
            and stealthy practice sessions and mock interviews.
          </p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#ea3a59]" />
              <span>comingsoon</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ea3a59]" />
              <span>Hyderabad, Telangana</span>
            </div>
          </div>

          <p className="text-muted-foreground mt-6 text-xs">
            © {currentYear}{" "}
            <span className="font-semibold text-[#ea3a59]">Off* Radar</span>.
            All rights reserved.
          </p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
            <p>
              website by{" "}
              <a 
                href="https://github.com/Riot-Just-Finished" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-[#ea3a59] hover:underline"
              >
                Riot-Just-Finished
              </a>
            </p>
            <p>
              ofradr by{" "}
              <a 
                href="https://github.com/SunnyCOdet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-[#ea3a59] hover:underline"
              >
                SunnyCOdet
              </a>
            </p>
          </div>
        </AnimatedContainer>

        {/* Link sections */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-2">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-white">
                  {section.label}
                </h3>
                <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="hover:text-foreground transition-all duration-300"
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
