interface MandatePayload {
    sendResponseFormat: string;
    regMode: string;
    entityId: string;
    can: string;
    riaNo: string;
    arnNo: string;
    subBrokArn: string;
    subBrokCode: string;
    euincode: string;
    accNo: string;
    accType: string;
    bankId: string;
    ifscCode: string;
    micrCode: string;
    maxAmt: string | number;
    startDate: string;
    endDate: string;
    investorId: string;
    mandateType: string;
}
