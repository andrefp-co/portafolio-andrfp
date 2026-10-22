import { personalData } from "@/utils/data/personal-data";
import { FaFacebook, FaStackOverflow } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";
import { SiLeetcode } from "react-icons/si";
import { BiLogoLinkedin } from "react-icons/bi";

// One set of profile links, used wherever they appear, so the hero, the
// contact section and the footer never drift apart. Empty URLs are skipped.
export const socials = [
  { label: "GitHub", href: personalData.github, Icon: IoLogoGithub },
  { label: "LinkedIn", href: personalData.linkedIn, Icon: BiLogoLinkedin },
  { label: "X", href: personalData.twitter, Icon: FaXTwitter },
  { label: "LeetCode", href: personalData.leetcode, Icon: SiLeetcode },
  { label: "Stack Overflow", href: personalData.stackOverflow, Icon: FaStackOverflow },
  { label: "Facebook", href: personalData.facebook, Icon: FaFacebook },
].filter(({ href }) => href);

export default function SocialLinks({ className = "" }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {socials.map(({ label, href, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="sw-icon-btn">
            <Icon size={18} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
