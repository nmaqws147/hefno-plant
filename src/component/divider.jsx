// components/Devider/Devider.jsx
import './divider.css'; // تأكد من وجود ملف الـ CSS هذا

export const Devider = () => {
    return (
        <svg className="editorial" 
     xmlns="http://www.w3.org/2000/svg"
     viewBox="0 24 150 28 "
     preserveAspectRatio="none">
 <defs>
 <path id="gentle-wave"
 d="M-160 44c30 0 
    58-18 88-18s
    58 18 88 18 
    58-18 88-18 
    58 18 88 18
    v44h-352z" />
  </defs>
  <g className="parallax1"> 
   <use xlinkHref="#gentle-wave" x="50" y="3" fill="#8bc34a"/> 
  </g>
    <g className="parallax2"> 
   <use xlinkHref="#gentle-wave" x="50" y="0" fill="#4caf50"/> 
    </g>
      <g className="parallax3"> 
   <use xlinkHref="#gentle-wave" x="50" y="9" fill="#2D6A4F"/> 
   </g>
    <g className="parallax4"> 
   <use xlinkHref="#gentle-wave" x="50" y="6" fill="#1a4d3a"/>   
  </g>
</svg>
    )
}