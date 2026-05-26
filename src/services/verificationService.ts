import { apiClient } from './api';

export interface VerificationApplication {
    certificationNumber: string;
    documents?: File[];
    description?: string;
    specialties?: string;
}

export interface VerificationStatus {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    appliedAt?: string;
    reviewedAt?: string;
}

export const verificationService = {
    /**
     * Apply to become a professional.
     * Backend: POST /professionals (creates a professional profile)
     */
    applyForProfessional: async (data: VerificationApplication) => {
        const payload: Record<string, any> = {
            description: data.description || `Professional with certification: ${data.certificationNumber}`,
            specialties: data.specialties || '',
            certificationNumber: data.certificationNumber,
        };
        const response = await apiClient.post('/professionals', payload);
        return response.data;
    },

    /**
     * Get the verification status of the current user's professional profile.
     * Backend: GET /professionals/user/:userId
     * We check if a professional profile exists for the user.
     */
    getVerificationStatus: async (): Promise<VerificationStatus> => {
        try {
            const response = await apiClient.get('/auth/profile');
            const user = response.data;
            // Check if user has professional role or a professional profile
            const roles = user?.roles?.map((r: any) => r.name || r) || [];
            if (roles.includes('professional')) {
                return { status: 'approved' };
            }
            return { status: 'none' };
        } catch {
            return { status: 'none' };
        }
    },

    uploadDocuments: async (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('documents', file));
        const response = await apiClient.post('/professionals/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
