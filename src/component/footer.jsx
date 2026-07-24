import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Star } from 'lucide-react';
import './footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'قاعدة المعرفة', path: '/knowledge-base' },
    { name: 'تشخيص الأمراض', path: '/diagnose' },
    { name: 'الطقس', path: '/weather' },
    { name: 'المدونة', path: '/blog' },
  ];

  const resourceLinks = [
    { name: 'المحاصيل', path: '/knowledge-base/plants-crops' },
    { name: 'الأسمدة', path: '/knowledge-base/fertilizer' },
    { name: 'المبيدات', path: '/knowledge-base/pesticides' },
    { name: 'الحشرات', path: '/knowledge-base/insects' },
    { name: 'الأمراض', path: '/knowledge-base/diseases' },
    { name: 'التقويم الزراعي', path: '/knowledge-base/calendar' },
  ];

  const contactItems = [
    { icon: Phone, label: 'هاتف', text: '+20 11 02118765' },
    { icon: Mail, label: 'بريد', text: 'elhfnaweedowidar21@gmail.com' },
    { icon: MapPin, label: 'عنوان', text: 'المنوفيه . مصر - تلا' },
  ];

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="hefno-footer">
      <div className="hefno-footer-ornament flex justify-center gap-3 text-primary/35 py-8 text-sm">
        {[1,2,3,4,5].map(i => <Star key={i} className="size-3.5" />)}
      </div>

      <div className="hefno-attribution">
        <div className="hefno-attribution-lines">
          <span className="hefno-attribution-line" />
          <span className="hefno-attribution-label">المدير التنفيذي</span>
          <span className="hefno-attribution-line" />
        </div>
        <div className="hefno-attribution-title-ar">المهندس الزراعي</div>
        <div className="hefno-attribution-name-ar">الحفناوي محمد دويدار</div>
        <div className="hefno-attribution-name-en">Agriculture Engineer Elhefnawy Mohamed Dwedar</div>
      </div>

      <div className="hefno-footer-container">
        <div className="hefno-footer-grid">
          <div className="hefno-footer-brand">
            <p className="hefno-footer-tagline">
              حيث تلتقي المعرفة الزراعية بالتقنية الحديثة
            </p>
            <p className="hefno-footer-description">
              منصة متكاملة تهدف إلى تمكين المزارعين والمهتمين بالمجال الزراعي من خلال
              أحدث المعلومات العلمية والتقنيات الذكية لتشخيص الأمراض ومتابعة الطقس وإدارة المحاصيل.
            </p>
          </div>

          <div>
            <h3 className="hefno-footer-title">روابط سريعة</h3>
            <ul className="hefno-footer-links">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button onClick={() => handleNav(link.path)} className="hefno-footer-link">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="hefno-footer-title">المعرفة</h3>
            <ul className="hefno-footer-links">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  <button onClick={() => handleNav(link.path)} className="hefno-footer-link">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="hefno-footer-title">تواصل</h3>
            <ul className="hefno-footer-contact-list">
              {contactItems.map((item, i) => {
                const IconComp = item.icon;
                return (
                <li key={i} className="hefno-footer-contact-item">
                  <span className="hefno-footer-contact-icon"><IconComp size={14} /></span>
                  <span className="hefno-footer-contact-text">
                    <span className="hefno-footer-contact-label">{item.label}</span>
                    {item.text}
                  </span>
                </li>
              );})}
            </ul>

            <div className="hefno-footer-social">
              <a href="https://www.facebook.com/elhfnawee.dowidar.5" className="hefno-footer-social-btn" aria-label="Facebook" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://wa.me/+201102118765" className="hefno-footer-social-btn" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://www.youtube.com/@Eng-elhefnawy" className="hefno-footer-social-btn" aria-label="YouTube" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 00-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.015 3.015 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@elhefnawyde" className="hefno-footer-social-btn" aria-label="TikTok" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.8.12-.79.38-1.46 1.07-1.7 1.9-.13.45-.15.92-.12 1.39.07 1.18.81 2.25 1.88 2.77 1.02.59 2.42.51 3.4-.16.64-.42 1.08-1.1 1.29-1.85.17-.48.18-.99.18-1.48-.01-5.07 0-10.14-.02-15.21z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="hefno-footer-divider"></div>

      <div className="hefno-footer-bottom">
        <div className="hefno-footer-copyright">
          © {new Date().getFullYear()} <a href="/">HEFNOPLANT</a> — جميع الحقوق محفوظة
        </div>
        <div className="hefno-footer-bottom-links">
          <button onClick={() => handleNav('/privacy')} className="hefno-footer-bottom-link">سياسة الخصوصية</button>
          <button onClick={() => handleNav('/terms')} className="hefno-footer-bottom-link">الشروط والأحكام</button>
          <button onClick={() => handleNav('/about')} className="hefno-footer-bottom-link">من نحن</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
