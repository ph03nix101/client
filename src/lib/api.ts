import axios from 'axios';
import { Category, CategoryAttribute, ReferenceComponent, CreateProductPayload, Product, Auction, Bid } from '@/types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Enable cookies for auth
});

export const categoriesApi = {
    getAll: () => api.get<Category[]>('/categories').then(res => res.data),
    getWithCounts: () => api.get<(Category & { product_count: number })[]>('/categories/with-counts').then(res => res.data),
    getAttributes: (slug: string) =>
        api.get<CategoryAttribute[]>(`/categories/${slug}/attributes`).then(res => res.data),
};

export const componentsApi = {
    search: (query: string, type: 'CPU' | 'GPU', category: 'Laptop' | 'Desktop') =>
        api.get<ReferenceComponent[]>('/components/search', {
            params: { q: query, type, category },
        }).then(res => res.data),
};

export interface ProductSearchFilters {
    q?: string;
    category_id?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string[];
    specs?: Record<string, string[]>;
    sort?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';
    page?: number;
    limit?: number;
}

export interface ProductsResponse {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
}

export const productsApi = {
    create: (payload: CreateProductPayload) =>
        api.post<Product>('/products', payload).then(res => res.data),
    search: (filters?: ProductSearchFilters) => {
        // Build params object with spec filters flattened
        const params: Record<string, string | number | undefined> = {
            q: filters?.q,
            category_id: filters?.category_id,
            minPrice: filters?.minPrice,
            maxPrice: filters?.maxPrice,
            condition: filters?.condition?.join(','),
            sort: filters?.sort,
            page: filters?.page,
            limit: filters?.limit,
        };
        // Add spec filters as specs.key=value
        if (filters?.specs) {
            for (const [key, values] of Object.entries(filters.specs)) {
                if (values && values.length > 0) {
                    params[`specs.${key}`] = values.join(',');
                }
            }
        }
        return api.get<ProductsResponse>('/products', { params }).then(res => res.data);
    },
    getAll: (filters?: { category_id?: number; brand?: string; minPrice?: number; maxPrice?: number }) =>
        api.get<ProductsResponse>('/products', { params: filters }).then(res => res.data.products),
    getById: (id: string) =>
        api.get<Product>(`/products/${id}`).then(res => res.data),
    getBySeller: (sellerId: string) =>
        api.get<Product[]>(`/products/seller/${sellerId}`).then(res => res.data),
    getSimilar: (id: string, limit?: number) =>
        api.get<Product[]>(`/products/${id}/similar`, { params: limit ? { limit } : {} }).then(res => res.data),
    getTrending: (limit?: number) =>
        api.get<Product[]>('/products/trending', { params: limit ? { limit } : {} }).then(res => res.data),
    update: (id: string, updates: Partial<CreateProductPayload>) =>
        api.patch<Product>(`/products/${id}`, updates).then(res => res.data),
    updateStatus: (id: string, status: string) =>
        api.patch<Product>(`/products/${id}/status`, { status }).then(res => res.data),
    delete: (id: string) =>
        api.delete(`/products/${id}`).then(res => res.data),
};

export interface ProductImage {
    id: number;
    product_id: string;
    url: string;
    filename: string;
    is_primary: boolean;
    display_order: number;
}

export const uploadsApi = {
    uploadSingle: async (productId: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post<ProductImage>(`/uploads/product/${productId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(res => res.data);
    },
    uploadMultiple: async (productId: string, files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return api.post<ProductImage[]>(`/uploads/product/${productId}/multiple`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(res => res.data);
    },
    getProductImages: (productId: string) =>
        api.get<ProductImage[]>(`/uploads/product/${productId}`).then(res => res.data),
    setPrimary: (imageId: number, productId: string) =>
        api.post(`/uploads/${imageId}/primary`, { productId }).then(res => res.data),
    deleteImage: (imageId: number) =>
        api.delete(`/uploads/${imageId}`).then(res => res.data),
};

export interface User {
    id: string;
    email: string;
    username: string;
    full_name: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar_url?: string;
    is_verified_seller: boolean;
    is_admin?: boolean;
    created_at: string;
}

export const usersApi = {
    getById: (id: string) =>
        api.get<User>(`/users/${id}`).then(res => res.data),
    update: (id: string, updates: Partial<Pick<User, 'full_name' | 'phone' | 'location' | 'bio' | 'avatar_url'>>) =>
        api.patch<User>(`/users/${id}`, updates).then(res => res.data),
    deleteAccount: (password: string) =>
        api.delete<{ message: string }>('/users/me', { data: { password } }).then(res => res.data),
    // Admin endpoints
    getAll: () =>
        api.get<User[]>('/users').then(res => res.data),
    setAdmin: (id: string, is_admin: boolean) =>
        api.patch<User>(`/users/${id}/admin`, { is_admin }).then(res => res.data),
    setVerified: (id: string, is_verified: boolean) =>
        api.patch<User>(`/users/${id}/verified`, { is_verified }).then(res => res.data),
};

// Auth types
export interface AuthUser {
    id: string;
    email: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    is_verified_seller?: boolean;
    is_admin?: boolean;
}

export interface AuthResponse {
    user: AuthUser;
    access_token: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    full_name: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authApi = {
    register: (data: RegisterData) =>
        api.post<AuthResponse>('/auth/register', data).then(res => res.data),
    login: (data: LoginData) =>
        api.post<AuthResponse>('/auth/login', data).then(res => res.data),
    logout: () =>
        api.post('/auth/logout').then(res => res.data),
    getMe: () =>
        api.get<{ user: AuthUser }>('/auth/me').then(res => res.data),
    forgotPassword: (email: string) =>
        api.post<{ message: string; token?: string }>('/auth/forgot-password', { email }).then(res => res.data),
    resetPassword: (token: string, password: string) =>
        api.post<{ message: string }>('/auth/reset-password', { token, password }).then(res => res.data),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.patch<{ message: string }>('/auth/change-password', { currentPassword, newPassword }).then(res => res.data),
};

// Verification types
export interface VerificationRequest {
    id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    business_name?: string;
    business_address?: string;
    reason?: string;
    admin_notes?: string;
    created_at: string;
}

export interface CreateVerificationData {
    business_name: string;
    business_address?: string;
    reason: string;
}

export const verificationApi = {
    apply: (data: CreateVerificationData) =>
        api.post<VerificationRequest>('/verification/apply', data).then(res => res.data),
    getMyStatus: () =>
        api.get<{ request: VerificationRequest | null }>('/verification/my-status').then(res => res.data),
    // Admin endpoints
    getPending: () =>
        api.get<VerificationRequest[]>('/verification/admin/pending').then(res => res.data),
    review: (id: string, action: 'approve' | 'reject', notes?: string) =>
        api.patch<VerificationRequest>(`/verification/admin/${id}`, { action, notes }).then(res => res.data),
};

// Messaging types
export interface Conversation {
    id: string;
    product_id: string;
    buyer_id: string;
    seller_id: string;
    last_message_at: string;
    created_at: string;
    product_title?: string;
    other_user_name?: string;
    other_user_avatar?: string;
    other_user_id?: string;
    last_message?: string;
    unread_count?: number;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender_name?: string;
    sender_avatar?: string;
}

export const messagesApi = {
    getConversations: () =>
        api.get<Conversation[]>('/messages/conversations').then(res => res.data),
    getConversation: (id: string) =>
        api.get<{ conversation: Conversation; messages: Message[] }>(`/messages/conversations/${id}`).then(res => res.data),
    startConversation: (product_id: string, message: string) =>
        api.post<Conversation>('/messages/conversations', { product_id, message }).then(res => res.data),
    sendMessage: (conversationId: string, content: string) =>
        api.post<Message>(`/messages/conversations/${conversationId}`, { content }).then(res => res.data),
    markAsRead: (conversationId: string) =>
        api.patch(`/messages/conversations/${conversationId}/read`).then(res => res.data),
    getUnreadCount: () =>
        api.get<{ count: number }>('/messages/unread-count').then(res => res.data.count),
};

// Wishlist types
export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
    product_title?: string;
    product_price?: string;
    product_condition?: string;
    product_status?: string;
    category_id?: number;
}

export const wishlistApi = {
    getWishlist: () =>
        api.get<WishlistItem[]>('/wishlist').then(res => res.data),
    checkWishlist: (productId: string) =>
        api.get<{ isInWishlist: boolean }>(`/wishlist/check/${productId}`).then(res => res.data.isInWishlist),
    addToWishlist: (productId: string) =>
        api.post<WishlistItem>(`/wishlist/${productId}`).then(res => res.data),
    removeFromWishlist: (productId: string) =>
        api.delete(`/wishlist/${productId}`).then(res => res.data),
    toggleWishlist: (productId: string) =>
        api.post<{ added: boolean }>(`/wishlist/${productId}/toggle`).then(res => res.data),
    getCount: () =>
        api.get<{ count: number }>('/wishlist/count').then(res => res.data.count),
};

// Reports API
export interface Report {
    id: string;
    product_id: string;
    reporter_id: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    admin_notes?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    created_at: string;
    product_title?: string;
    reporter_name?: string;
    reporter_email?: string;
}

export const reportsApi = {
    create: (productId: string, reason: string, description?: string) =>
        api.post<Report>('/reports', { product_id: productId, reason, description }).then(res => res.data),
    // Admin endpoints
    getAll: (status?: string) =>
        api.get<Report[]>('/reports', { params: status ? { status } : {} }).then(res => res.data),
    getById: (id: string) =>
        api.get<Report>(`/reports/${id}`).then(res => res.data),
    updateStatus: (id: string, status: string, adminNotes?: string) =>
        api.patch<Report>(`/reports/${id}/status`, { status, admin_notes: adminNotes }).then(res => res.data),
    getPendingCount: () =>
        api.get<{ count: number }>('/reports/pending-count').then(res => res.data.count),
};

// Auction types
// Auction types - Imported from @/types


export const auctionsApi = {
    create: (productId: string, startingPrice: number, durationHours: number, reservePrice?: number, buyNowPrice?: number) =>
        api.post<Auction>('/auctions', {
            product_id: productId,
            starting_price: startingPrice,
            duration_hours: durationHours,
            reserve_price: reservePrice,
            buy_now_price: buyNowPrice,
        }).then(res => res.data),
    placeBid: (auctionId: string, amount: number) =>
        api.post<{ auction: Auction; bid: Bid }>(`/auctions/${auctionId}/bid`, { amount }).then(res => res.data),
    getActive: (limit?: number, categoryId?: number) =>
        api.get<Auction[]>('/auctions', { params: { limit, category_id: categoryId } }).then(res => res.data),
    getById: (id: string) =>
        api.get<Auction>(`/auctions/${id}`).then(res => res.data),
    getByProductId: (productId: string) =>
        api.get<Auction | null>(`/auctions/product/${productId}`).then(res => res.data),
    getBidHistory: (auctionId: string) =>
        api.get<Bid[]>(`/auctions/${auctionId}/bids`).then(res => res.data),
    getMyBids: () =>
        api.get<any[]>('/auctions/my-bids').then(res => res.data),
    cancel: (auctionId: string) =>
        api.patch<Auction>(`/auctions/${auctionId}/cancel`).then(res => res.data),
};

export default api;
