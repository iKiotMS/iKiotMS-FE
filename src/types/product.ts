export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";
export type LocationType = "branch" | "warehouse";

export interface ProductImage {
  _id?: string;
  url: string;
  isThumbnail: boolean;
}

export interface ProductDetail {
  _id?: string;
  name: string;
  value: string;
}

export interface StockDetail {
  inventoryId: string;
  locationId: string;
  locationType: LocationType;
  stock: number;
}

// Populated subset of Supplier as returned on ProductItem.suppliers
// (BE populates only these fields — see ProductService.getProductById/addSupplierToItem).
export interface ProductItemSupplier {
  id: string;
  supplierName: string;
  email?: string;
  phoneNumber?: string;
}

export interface ProductItem {
  id: string;
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
  productDetails?: ProductDetail[];
  suppliers?: ProductItemSupplier[];
  stock?: number;
  stockDetails?: StockDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  brandId?: string;
  categoryId?: string;
  name: string;
  status: ProductStatus;
  categoryName?: string;
  images?: ProductImage[];
  items?: ProductItem[];
  totalStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetailResponse extends Product {
  items: ProductItem[];
}

export interface ProductQueryParams {
  search?: string;
  q?: string;
  status?: ProductStatus;
  categoryId?: string;
  supplierId?: string;
  locationId?: string;
  locationType?: LocationType;
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

export interface ProductSearchParams {
  q?: string;
  status?: ProductStatus;
  categoryId?: string;
  supplierId?: string;
  locationId?: string;
  locationType?: LocationType;
  page?: number;
  limit?: number;
}

export interface InitialStock {
  locationId: string;
  locationType: LocationType;
}

export interface ProductItemCreatePayload {
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
  productDetails?: ProductDetail[];
  initialStock?: InitialStock[];
}

export interface ProductItemUpdatePayload {
  productName?: string;
  productCode?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  retailPrice?: number;
  costPrice?: number;
  VAT?: number;
  warrantyPeriod?: string;
  images?: ProductImage[];
  productDetails?: ProductDetail[];
}

export interface ProductCreatePayload {
  name: string;
  brandId?: string | null;
  categoryId?: string | null;
  status: ProductStatus;
  images?: ProductImage[];
  items: ProductItemCreatePayload[];
}

export interface ProductUpdatePayload {
  name?: string;
  brandId?: string | null;
  categoryId?: string | null;
  status?: ProductStatus;
  images?: ProductImage[];
}
