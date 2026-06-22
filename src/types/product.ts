export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

export interface ProductImage {
  url: string;
  isThumbnail: boolean;
}

export interface Product {
  id: string;
  tenantId: string;
  brandId?: string;
  categoryId?: string;
  supplierId?: string;
  name: string;
  status: ProductStatus;
  categoryName?: string;
  images?: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductItem {
  id?: string;
  tenantId: string;
  productId: string;
  productName: string;
  productCode: string;
  sku: string;
  barcode?: string;
  description?: string;
  retailPrice: number;
  costPrice: number;
  VAT?: number;
  warrantyPeriod?: string;
  images?: ProductImage[];
}

export interface ProductDetailResponse extends Product {
  items: ProductItem[];
}

export interface ProductQueryParams {
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: PaginationResponse;
}

export interface ProductItemCreatePayload {
  productCode: string;
  sku: string;
  barcode?: string;
  description?: string;
  retailPrice: number;
  costPrice: number;
  VAT?: number;
  warrantyPeriod?: string;
  images?: ProductImage[];
}

export interface ProductCreatePayload {
  name: string;
  brandId?: string;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  status: ProductStatus;
  images?: ProductImage[];
  items: ProductItemCreatePayload[];
}

export interface ProductUpdatePayload {
  name?: string;
  brandId?: string;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  status?: ProductStatus;
  images?: ProductImage[];
}
