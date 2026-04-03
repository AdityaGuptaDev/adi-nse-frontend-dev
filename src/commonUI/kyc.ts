const API_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;
const aadharJson = {
    ref_id: "46510084",
    aadhar_no: "123456789012",
    status: "VALID",
    message: "Aadhaar Card Exists",
    care_of: "S/O: Mehta S.N.K. Sinha",
    address: "test address",
    dob: "07-01-1982",
    email: "794e03306586e61b6f03909c31e320167636999a9bfc26bdf0affd35d87c3cbb",
    gender: "M",
    name: "Rakesh Kumar Sinha",
    split_address: {
        country: "India",
        dist: "Ranchi",
        house: "H. No. 34",
        landmark: "",
        pincode: "834001",
        po: "Ranchi University",
        state: "Jharkhand",
        street: "Main Road",
        subdist: "Ranchi",
        vtc: "Near Sujata Chowk",
        locality: ""
    },
    year_of_birth: "1982",
    mobile_hash: "8024e0aba954d5b02e1ce0631d4b3c56eaf861065fba749e73caf029f5222dbf",
    photo_link: "",
    share_code: "2345",
    xml_file: ""
};



export async function verifyAadhar(id: string): Promise<any> {
    try {
        // Simulate async call (e.g. mimic fetch)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (aadharJson.aadhar_no === id) {
                    resolve(aadharJson);
                } else {
                    reject(new Error("Aadhaar number not found"));
                }
            }, 200); // 200ms delay to mimic async
        });
    } catch (error) {
        console.error(`Error verifying Aadhaar ${id}:`, error);
        throw error;
    }
}