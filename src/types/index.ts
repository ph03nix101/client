export interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}

export interface CategoryAttribute {
    id: number;
    category_id: number;
    key_name: string;
    label: string;
    input_type: 'text' | 'select' | 'number' | 'checkbox' | 'multiselect' | 'reference_search';
    options?: string[];
    data_source?: string;
    filter_context?: {
        component_type?: string;
        category?: string;
    };
    unit?: string;
    is_required: boolean;
    display_order: number;
}

export interface ReferenceComponent {
    id: number;
    component_type: 'CPU' | 'GPU';
    manufacturer: string;
    model_name: string;
    category: string;
    // CPU fields
    cores?: number;
    threads?: number;
    clock_speed_ghz?: string;  // Base clock in GHz
    boost_clock_ghz?: string;  // Turbo/Boost clock in GHz
    socket?: string;
    l3_cache?: string;
    tdp?: number;
    generation?: string;
    // GPU fields
    chipset?: string;
    memory_size?: string;
    memory_type?: string;
    memory_bus_width?: string;
    shader_count?: number;
    memory_clock?: string;
}

export interface CreateProductPayload {
    seller_id: string;
    category_id: number;
    title: string;
    price: number;
    description?: string;
    condition: string;
    specs: Record<string, unknown>;
    cpu_ref_id?: number;
    gpu_ref_id?: number;
}

export interface Product {
    id: string;
    seller_id: string;
    category_id: number;
    title: string;
    slug?: string;
    price: string;
    description?: string;
    condition: string;
    specs: Record<string, unknown>;
    cpu_ref_id?: number;
    gpu_ref_id?: number;
    status: 'Active' | 'Sold' | 'Draft' | 'Removed' | 'Auction';
    created_at: string;
    updated_at: string;
    auction?: Auction;
}

export interface Auction {
    id: string;
    product_id: string;
    starting_price: string;
    reserve_price: string | null;
    buy_now_price: string | null;
    current_bid: string | null;
    bid_count: number;
    highest_bidder_id: string | null;
    start_time: string;
    end_time: string;
    status: 'active' | 'ended' | 'cancelled' | 'sold';
    title?: string;
    seller_id?: string;
    seller_username?: string;
    product?: Product;
}

export interface Bid {
    id: string;
    auction_id: string;
    bidder_id: string;
    amount: string;
    created_at: string;
    username?: string;
}

