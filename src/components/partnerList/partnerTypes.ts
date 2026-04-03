// src/types/partnerTypes.ts
export interface ApiPartner {
  id: string;
  email: string;
  password?: string;
  name: string;
  mobile: string;
  isActive: boolean;
  roleId: number;
  // Add other fields from your API response as needed
}

export interface ApiPartnerListResponse {
  data: {
    data: ApiPartner[];
  };
  msg: string;
}

export interface TransformedPartner {
  id: string;
  name: string;
  pan: string;
  email: string;
  mobile: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
}