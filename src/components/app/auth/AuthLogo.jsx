import React from 'react';

const AuthLogo = () => {
  return (
    <div className="flex flex-col items-center mb-4 w-full shrink-0">
      <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center p-1">
        <img 
          src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
          alt="Radix Logo" 
          className="w-full h-full object-contain rounded-xl"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center font-extrabold text-2xl text-[#81B398]">R</div>';
          }}
        />
      </div>
    </div>
  );
};

export default AuthLogo;