import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Confetti from 'react-confetti';

export const Celebration = () => {
   const [show, setShow] = useState(true);

   useEffect(() => {
     const hideTimer = setTimeout(() => setShow(false), 5000);
     return () => {
       clearTimeout(hideTimer);
     };
   }, []);

  return (
    <>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }

          .popup-overlay {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background-color: rgba(34, 34, 34, 0.6);
              z-index: 1;
              display: flex;
              justify-content: center;
              align-items: center;
           }

          .congrats-text {
            font-size: 1.8rem;
            color: #ffc107;
            font-weight: bold;
            text-shadow: 0 0 15px #ffc107;
            animation: blink 1.5s linear infinite;
            white-space: nowrap;
          }
        `}
      </style>

      {show && (
        <>
          <Confetti />
          <div className="popup-overlay">
            <Typography className="congrats-text">
              🎉✨ Congratulations! ✨🎉
            </Typography>
          </div>
        </>
      )}
    </>
  );
};