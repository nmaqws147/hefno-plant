// components/home/ContactSection.jsx
import { useState } from 'react';
import { toast } from 'sonner';
import './contact.css';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  const result = await response.json();
  if (result.success) toast("تم الإرسال بنجاح!","success");

    
    // محاكاة إرسال النموذج
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // إخفاء رسالة النجاح بعد 5 ثواني
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: '📞',
      title: 'اتصل بنا',
      details: '+20 11 02118765',
      subDetails: 'السبت - الخميس '
    },
    {
      icon: '✉️',
      title: 'البريد الإلكتروني',
      details: 'elhfnaweedowidar21@gmail.com',
      subDetails: 'نرد خلال 24 ساعة'
    },
    {
      icon: '📍',
      title: 'العنوان',
      details: 'المنوفيه . مصر',
      subDetails: 'تلا'
    }
  ];

  return (
    <section className="hefno-contact" dir="rtl">
      {/* خلفية زخرفية */}
      <div className="hefno-contact-bg">
        <div className="hefno-contact-glow"></div>
        <div className="hefno-contact-particles"></div>
        <div className="hefno-contact-leaves">
          <div className="hefno-leaf leaf-1"></div>
          <div className="hefno-leaf leaf-2"></div>
          <div className="hefno-leaf leaf-3"></div>
        </div>
      </div>

      <div className="hefno-contact-container">
        {/* عنوان القسم */}
        <div className="hefno-contact-header">
          <div className="hefno-contact-tag">
            <span className="hefno-tag-icon">🌱</span>
            <span className="hefno-tag-text">تواصل معنا</span>
          </div>
          <h2 className="hefno-contact-title">
            <span className="hefno-title-highlight">كيف نقدر نساعدك؟</span>
          </h2>
          <p className="hefno-contact-subtitle">
            فريقنا متاح للإجابة على استفساراتك وتقديم الدعم الفني
          </p>
        </div>

        <div className="hefno-contact-wrapper">
          {/* معلومات الاتصال */}
          <div className="hefno-contact-info">
            {contactInfo.map((item, index) => (
              <div key={index} className="hefno-info-card">
                <div className="hefno-info-icon-wrapper">
                  <span className="hefno-info-icon">{item.icon}</span>
                  <div className="hefno-info-glow"></div>
                </div>
                <div className="hefno-info-content">
                  <h3 className="hefno-info-title">{item.title}</h3>
                  <p className="hefno-info-details">{item.details}</p>
                  <p className="hefno-info-subdetails">{item.subDetails}</p>
                </div>
              </div>
            ))}

            {/* وسائل التواصل الاجتماعي */}
            <div className="hefno-social-wrapper">
              <h4 className="hefno-social-title">تابعنا على</h4>
            <div className="hefno-social-wrapper">
  <a href="https://www.facebook.com/elhfnawee.dowidar.5" className="hefno-social-btn facebook" aria-label="Facebook" target="_blank" rel="noreferrer">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  </a>

  <a href="https://wa.me/+201102118765" className="hefno-social-btn whatsapp" aria-label="WhatsApp" target="_blank" rel="noreferrer">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>

  <a href="https://www.youtube.com/@Eng-elhefnawy" className="hefno-social-btn youtube" aria-label="YouTube" target="_blank" rel="noreferrer">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 00-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.015 3.015 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  </a>

  <a href="https://www.tiktok.com/@elhefnawyde" className="hefno-social-btn tiktok" aria-label="TikTok" target="_blank" rel="noreferrer">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.8.12-.79.38-1.46 1.07-1.7 1.9-.13.45-.15.92-.12 1.39.07 1.18.81 2.25 1.88 2.77 1.02.59 2.42.51 3.4-.16.64-.42 1.08-1.1 1.29-1.85.17-.48.18-.99.18-1.48-.01-5.07 0-10.14-.02-15.21z"/></svg>
  </a>
</div>
            </div>
          </div>

          {/* نموذج الاتصال */}
          <div className="hefno-contact-form-wrapper">
            <div className="hefno-form-glass"></div>
            <form className="hefno-contact-form" onSubmit={handleSubmit}>
              <h3 className="hefno-form-title">أرسل لنا رسالة</h3>
              
              <div className="hefno-form-group">
                <label htmlFor="name" className="hefno-form-label">الاسم كامل</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="hefno-form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="hefno-form-row">
                <div className="hefno-form-group">
                  <label htmlFor="email" className="hefno-form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="hefno-form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@domain.com"
                  />
                </div>

                <div className="hefno-form-group">
                  <label htmlFor="phone" className="hefno-form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="hefno-form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+20 XXX XXX XXXX"
                  />
                </div>
              </div>

              <div className="hefno-form-group">
                <label htmlFor="message" className="hefno-form-label">الرسالة</label>
                <textarea
                  id="message"
                  name="message"
                  className="hefno-form-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="اكتب رسالتك هنا..."
                  rows="5"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="hefno-form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <span>
                    إرسال الرسالة
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M17 10L3 10M17 10L13 14M17 10L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="hefno-form-success">
                  تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* خريطة موقع (اختياري) */}
        {/* <div className="hefno-location-card">
  <div className="hefno-map-overlay"></div>
  <div className="hefno-map-container">
    <div className="hefno-map-info">
      <span className="hefno-pin-pulse">📍</span>
      <span className="hefno-author-tag"> 
        <a href="https://wa.me/+201025374656" target="_blank" rel="noreferrer">
          Made By Uncle Sam
        </a>
      </span>
    </div>
  </div>
        </div> */}
      </div>
    </section>
  );
};

export default ContactSection;