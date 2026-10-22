// @flow strict

import { personalData } from "@/utils/data/personal-data";
import Link from "next/link";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { FaFacebook, FaTwitterSquare } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const socials = [
  { label: "GitHub", href: personalData.github, Icon: BsGithub },
  { label: "LinkedIn", href: personalData.linkedIn, Icon: BsLinkedin },
  { label: "Facebook", href: personalData.facebook, Icon: FaFacebook },
  { label: "LeetCode", href: personalData.leetcode, Icon: SiLeetcode },
  { label: "X / Twitter", href: personalData.twitter, Icon: FaTwitterSquare },
];

const skills = ['C/C++', 'MATLAB', 'Python', "JSON API's", 'Altium', 'SolidWorks', 'LTSpice', 'ANSYS', 'Java/JS'];

function HeroSection() {
  return (
    <section className="sw-bg-grid border-b border-[var(--sw-rule)]">
      <div className="sw-container grid grid-cols-1 items-center gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <p className="sw-eyebrow">Engineering Portfolio</p>
          <h1 className="sw-display">{personalData.name}</h1>
          <p className="sw-title mt-5">{personalData.designation}.</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="#contact" className="sw-btn sw-btn-primary">
              Contact me
            </Link>
            <Link href={personalData.resume} target="_blank" className="sw-btn sw-btn-ghost">
              Get resume
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {socials.filter(({ href }) => href).map(({ label, href, Icon }) => (
              <Link key={label} href={href} target="_blank" aria-label={label} className="sw-icon-btn">
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>

        <div className="sw-panel">
          <div className="sw-panel-bar">
            <span className="sw-label">engineer.js</span>
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 border border-[var(--sw-gray)]"></span>
              <span className="h-2 w-2 border border-[var(--sw-gray)]"></span>
              <span className="h-2 w-2 bg-[var(--sw-gray)]"></span>
            </span>
          </div>
          <code className="block overflow-x-auto px-5 py-6 text-xs leading-7 md:text-[13px] lg:px-7">
            <div>
              <span className="tk-kw mr-2">const</span>
              <span className="tk-str mr-2">engineer</span>
              <span className="tk-kw mr-2">=</span>
              <span className="tk-pun">{'{'}</span>
            </div>
            <div className="ml-4 lg:ml-8">
              <span className="tk-prop mr-2">name:</span>
              <span className="tk-pun">{`'`}</span>
              <span className="tk-str">Andres</span>
              <span className="tk-pun">{`',`}</span>
            </div>
            <div className="ml-4 lg:ml-8">
              <span className="tk-prop mr-2">skills:</span>
              <span className="tk-pun">{`[`}</span>
              {skills.map((skill, i) => (
                <span key={skill}>
                  <span className="tk-pun">{`'`}</span>
                  <span className="tk-str">{skill}</span>
                  <span className="tk-pun">{i < skills.length - 1 ? "', " : "'"}</span>
                </span>
              ))}
              <span className="tk-pun">{`],`}</span>
            </div>
            <div className="ml-4 lg:ml-8">
              <span className="tk-prop mr-2">hardWorker:</span>
              <span className="tk-kw">true</span>
              <span className="tk-pun">,</span>
            </div>
            <div className="ml-4 lg:ml-8">
              <span className="tk-prop mr-2">quickLearner:</span>
              <span className="tk-kw">true</span>
              <span className="tk-pun">,</span>
            </div>
            <div className="ml-4 lg:ml-8">
              <span className="tk-prop mr-2">problemSolver:</span>
              <span className="tk-kw">true</span>
              <span className="tk-pun">,</span>
            </div>
            <div className="ml-4 lg:ml-8">
              <span className="tk-prop mr-2">hireable:</span>
              <span className="tk-kw">function</span>
              <span className="tk-pun">{'() {'}</span>
            </div>
            <div className="ml-8 lg:ml-16">
              <span className="tk-kw mr-2">return</span>
              <span className="tk-pun">{`(`}</span>
            </div>
            <div className="ml-12 lg:ml-24">
              <span className="tk-pun">this.</span>
              <span className="tk-prop mr-2">hardWorker</span>
              <span className="tk-kw">&amp;&amp;</span>
            </div>
            <div className="ml-12 lg:ml-24">
              <span className="tk-pun">this.</span>
              <span className="tk-prop mr-2">problemSolver</span>
              <span className="tk-kw">&amp;&amp;</span>
            </div>
            <div className="ml-12 lg:ml-24">
              <span className="tk-pun">this.</span>
              <span className="tk-prop mr-2">skills.length</span>
              <span className="tk-kw mr-2">&gt;=</span>
              <span className="tk-kw">5</span>
            </div>
            <div className="ml-8 lg:ml-16"><span className="tk-pun">{`);`}</span></div>
            <div className="ml-4 lg:ml-8"><span className="tk-pun">{`};`}</span></div>
            <div><span className="tk-pun">{`};`}</span></div>
          </code>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
