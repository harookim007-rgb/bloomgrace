import { Link } from "react-router-dom";
import { useDesign } from "@/hooks/useDesign";

// Notice strip above the header, managed in the admin design editor.
const AnnouncementBar = () => {
  const { announcement } = useDesign();
  const text = announcement.text.trim();
  if (!announcement.enabled || !text) return null;

  const link = announcement.link.trim();
  const className = "block w-full bg-primary text-primary-foreground text-center text-xs md:text-sm font-sans font-medium px-4 py-2 break-words";
  if (/^https?:\/\//.test(link)) return <a href={link} target="_blank" rel="noopener noreferrer" className={className}>{text}</a>;
  if (link.startsWith("/")) return <Link to={link} className={className}>{text}</Link>;
  return <div className={className}>{text}</div>;
};

export default AnnouncementBar;
