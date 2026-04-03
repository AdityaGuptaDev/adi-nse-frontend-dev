"use client";

import React from "react";

interface CustomCardProps {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({
  imageSrc,
  imageAlt = "Card image",
  title,
  description,
  buttonLabel = "Action",
  onButtonClick,
  className = "",
}) => {
  return (
    <div className={`card bg-base-100 w-96 shadow-sm ${className}`}>
      {imageSrc ? (
        <figure>
          <img src={imageSrc} alt={imageAlt} />
        </figure>
      ) : null}

      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={onButtonClick}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCard;

// "use client";

// import React from "react";

// function CustomCard({ children, ...props }: any) {
//   return (
//     <div
//       className={`card bg-neutral text-neutral-content w-96 ${props.className}`}
//     >
//       {children}
//     </div>
//   );
// }

// export default CustomCard;
