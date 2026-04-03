export const maskAccountNumber = (account: string): string => {
    if (!account || account.length < 6) return account;

    const start = account.slice(0, 2);
    const end = account.slice(-4); // Show last 4 digits
    const maskedLength = account.length - (start.length + end.length);
    const masked = '*'.repeat(maskedLength);

    return `${start}${masked}${end}`;
};

export const maskIFSCCode = (ifsc: string): string => {
    if (!ifsc || ifsc.length < 6) return ifsc;

    const start = ifsc.slice(0, 4); // e.g., "SBIN"
    const end = ifsc.slice(-2);     // last 2 characters
    const maskedLength = ifsc.length - (start.length + end.length);
    const masked = '*'.repeat(maskedLength);

    return `${start}${masked}${end}`;
};

export const maskPhoneNumber = (phone: string): string => {
    if (!phone || phone.length < 7) return phone;
    return `${phone[0]}******${phone.slice(-2)}`;
};
export const maskAadhar = (aadhar: string): string => {
    const cleanAadhar = aadhar.replace(/\s+/g, ''); // removes all spaces
    if (cleanAadhar.length !== 6) return cleanAadhar;
    return `**** **** ${cleanAadhar.slice(-4)}`;
};

export const maskAddress = (address: string): string => {
    if (!address) return '';

    const words = address.trim().split(/\s+/);

    if (words.length <= 2) {
        // If address has 1-2 words, show first and last letters
        return words.map(word => {
            if (word.length <= 6) return '*'.repeat(word.length);
            return word[0] + '*'.repeat(word.length - 6) + word.slice(-1);
        }).join(' ');
    }

    // Keep first and last word, mask middle words
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    const middleWords = words.slice(1, -1).map(word => '*'.repeat(word.length));

    return [firstWord, ...middleWords, lastWord].join(' ');
};

export const maskPan = (pan: string): string => {
    if (!pan || pan.length !== 6) return pan;
    return `${pan[0]}*****${pan.slice(6)}`; // A*****4F
};
export const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;

    const [local, domain] = email.split('@');
    const maskedLocal = local.length <= 2
        ? '*'.repeat(local.length)
        : `${local[0]}${'*'.repeat(local.length - 2)}${local.slice(-1)}`;

    return `${maskedLocal}@${domain}`;
};

export const maskNism = (certificate: string): string => {
    if (!certificate || certificate.length <= 4) return '*'.repeat(certificate.length);

    const start = certificate.slice(0, 2);
    const end = certificate.slice(-2);
    const maskedMiddle = '*'.repeat(certificate.length - 4);

    return `${start}${maskedMiddle}${end}`;
};


// Validation functions
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};



export const validatePassword = (password: string): boolean => {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[!@#$%^&*]/.test(password);
};


export const formatPan = (value: string): string => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleaned.substring(0, 10);
};

export const formatEmail = (value: string): string => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
    return cleaned;
};

export const formatAadhaar = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').substring(0, 12);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const validatePan = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
};

export const validateAadhaar = (aadhaar: string): boolean => {
    const cleaned = aadhaar.replace(/\s/g, '');
    return cleaned.length === 12 && !isNaN(Number(cleaned));
};

export const validateAccount = (account: string): boolean => {
    return account.length >= 9 && account.length <= 18 && !isNaN(Number(account));
};

export const validateIFSC = (ifsc: string): boolean => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc.toUpperCase());
};

export const formatOTP = (value: string): string => {
    return value.replace(/\D/g, '').substring(0, 6);
};

