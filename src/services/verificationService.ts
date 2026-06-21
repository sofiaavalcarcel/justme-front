import { apiClient } from './api';

export interface VerificationApplication {
    reason: string;
    documents?: File[];
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
     * Backend: POST /professionals/apply (multipart/form-data)
     */
    applyForProfessional: async (data: VerificationApplication) => {
        const formData = new FormData();
        formData.append('reason', data.reason);
        if (data.documents) {
            data.documents.forEach(file => formData.append('certifications', file));
        }
        const response = await apiClient.post('/professionals/apply', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Get the verification status of the current user's professional profile.
     */
    getVerificationStatus: async (): Promise<VerificationStatus> => {
        try {
            // First check if there's a pending application
            const response = await apiClient.get('/auth/profile');
            const user = response.data;
            const roles = user?.roles?.map((r: any) => r.name || r) || [];
            if (roles.includes('professional')) {
                return { status: 'approved' };
            }
            // Check for pending applications
            try {
                const appRes = await apiClient.get('/professionals/apply/status');
                if (appRes.data?.status) return { status: appRes.data.status };
            } catch {
                // endpoint may not exist yet, fallback
            }
            return { status: 'none' };
        } catch {
            return { status: 'none' };
        }
    },

    /** Admin: list all professional applications */
    getApplications: async (status?: string) => {
        const res = await apiClient.get('/admin/professional-applications', {
            params: status ? { status } : {},
        });
        return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },

    /** Admin: approve or reject an application */
    updateApplicationStatus: async (applicationId: number, status: 'approved' | 'rejected', adminNotes?: string) => {
        const response = await apiClient.patch(`/admin/professional-applications/${applicationId}/review`, {
            status,
            adminNotes
        });
        return response.data;
    }
};
