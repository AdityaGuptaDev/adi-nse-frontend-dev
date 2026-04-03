"use client";

import React, { useState } from "react";
import InitialScreen from "./(components)/initial-screen";
import KYCInitial from "./(components)/KYC-initial";


function KYC() {
  const [KYCFlow, setKYCSFlow] = useState<any>(false);
  const [KYCFlowScreen, setKYCFlowScreen] = useState<any>(false);


  return (
    <div>
      {!KYCFlow ? <InitialScreen setKYCSFlow={setKYCSFlow} setKYCFlowScreen={setKYCFlowScreen} /> : <KYCInitial />}
    </div>
  );
}

export default KYC;
