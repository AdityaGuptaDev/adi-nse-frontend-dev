"use client";

import React, { useState } from "react";
import InitialScreen from "./(components)/initial-screen";
import KYCInitial from "./(components)/KYC-initial";


function KYC() {
  const [KYCFlow, setKYCSFlow] = useState<any>(false);
  const [KYCFlowScreen, setKYCFlowScreen] = useState<any>(false);


  return (
    <div className="min-h-screen bg-[#0A0A0A] w-full">
      <div className="container mx-auto px-4 py-6">
        {!KYCFlow ? (
          <InitialScreen 
            setKYCSFlow={setKYCSFlow} 
            setKYCFlowScreen={setKYCFlowScreen} 
          />
        ) : (
          <KYCInitial 
            KYCFlowScreen={KYCFlowScreen}
            setKYCFlowScreen={setKYCFlowScreen}
          />
        )}
      </div>
    </div>
  );
}

export default KYC;
