import client from "./client";
import type {
  StockMovement,
  StockMovementListResponse,
  StockMovementQueryParams,
  CreateImportPayload,
  CreateTransferPayload,
  ReceiveRequestPayload,
  LocationType,
  StockMovementLocationOption,
  StockMovementProductItemOption,
  StockMovementSupplierOption,
} from "@/types/stock-movement";

type ApiRef = string | { _id?: string; supplierName?: string; fullName?: string };

type ApiMovementDetail = {
  productItemId?: string | { _id?: string; sku?: string; productName?: string };
  quantity?: number;
  importPrice?: number;
  receivedQuantity?: number;
  note?: string;
};

type ApiMovement = {
  _id: string;
  tenantId?: string;
  movementType?: StockMovement["movementType"];
  status?: StockMovement["status"];
  fromSupplierId?: ApiRef;
  fromLocationId?: string;
  fromLocationType?: LocationType;
  toLocationId?: string;
  toLocationType?: LocationType;
  requestedBy?: ApiRef;
  approvedBy?: ApiRef;
  note?: string;
  details?: ApiMovementDetail[];
  createdAt?: string;
  updatedAt?: string;
};

type ApiSupplier = {
  _id: string;
  supplierName?: string;
  name?: string;
};

type ApiLocation = {
  _id: string;
  name?: string;
};

type ApiProductItem = {
  _id: string;
  productName?: string;
  name?: string;
  sku?: string;
};

type ApiProduct = {
  name?: string;
  items?: ApiProductItem[];
  productItems?: ApiProductItem[];
};

function asArray<T>(value: T[] | T | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function resolveRefId(value?: ApiRef): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id ?? "";
}

function resolveSupplierName(value?: ApiRef): string | undefined {
  if (!value || typeof value === "string") return undefined;
  return value.supplierName;
}

function resolveUserName(value?: ApiRef): string {
  if (!value || typeof value === "string") return "";
  return value.fullName ?? "";
}

function mapDetail(raw: ApiMovementDetail) {
  const productRef = raw.productItemId;
  const productItemId =
    typeof productRef === "string" ? productRef : (productRef?._id ?? "");

  return {
    productItemId,
    productName: typeof productRef === "string" ? "" : (productRef?.productName ?? ""),
    sku: typeof productRef === "string" ? "" : (productRef?.sku ?? ""),
    quantity: raw.quantity ?? 0,
    importPrice: raw.importPrice ?? 0,
    receivedQuantity: raw.receivedQuantity ?? 0,
    note: raw.note,
  };
}

function mapMovement(raw: ApiMovement): StockMovement {
  return {
    _id: raw._id,
    tenantId: String(raw.tenantId ?? ""),
    movementType: raw.movementType ?? "TRANSFER",
    status: raw.status ?? "PENDING",
    fromSupplierId: resolveRefId(raw.fromSupplierId),
    supplierName: resolveSupplierName(raw.fromSupplierId),
    fromLocationId: raw.fromLocationId,
    fromLocationName: raw.fromLocationId,
    fromLocationType: raw.fromLocationType,
    toLocationId: raw.toLocationId ?? "",
    toLocationName: raw.toLocationId ?? "",
    toLocationType: raw.toLocationType ?? "warehouse",
    requestedBy: resolveRefId(raw.requestedBy),
    requestedByName: resolveUserName(raw.requestedBy),
    approvedBy: resolveRefId(raw.approvedBy) || undefined,
    approvedByName: resolveUserName(raw.approvedBy) || undefined,
    note: raw.note,
    details: (raw.details ?? []).map(mapDetail),
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

export const stockMovementApi = {
  getList: async (params?: StockMovementQueryParams): Promise<StockMovementListResponse> => {
    const response = await client.get("/stock-movements", { params });
    const payload = response.data ?? {};
    const list = Array.isArray(payload.data) ? payload.data : [];
    const pagination = payload.pagination ?? {};

    return {
      data: list.map(mapMovement),
      total: pagination.total ?? list.length,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? params?.limit ?? list.length,
      totalPages: pagination.totalPages ?? 1,
    };
  },

  getById: async (id: string): Promise<StockMovement> => {
    const response = await client.get(`/stock-movements/${id}`);
    return mapMovement(response.data?.data as ApiMovement);
  },

  createImport: async (payload: CreateImportPayload): Promise<StockMovement> => {
    const response = await client.post("/stock-movements", payload);
    return mapMovement(response.data?.data as ApiMovement);
  },

  createTransfer: async (payload: CreateTransferPayload): Promise<StockMovement> => {
    const response = await client.post("/stock-movements", payload);
    return mapMovement(response.data?.data as ApiMovement);
  },

  approve: async (id: string): Promise<StockMovement> => {
    const response = await client.patch(`/stock-movements/${id}/approve`);
    return mapMovement(response.data?.data as ApiMovement);
  },

  receive: async (id: string, payload: ReceiveRequestPayload): Promise<StockMovement> => {
    const response = await client.patch(`/stock-movements/${id}/receive`, payload);
    return mapMovement(response.data?.data as ApiMovement);
  },

  cancel: async (id: string): Promise<StockMovement> => {
    const response = await client.patch(`/stock-movements/${id}/cancel`);
    return mapMovement(response.data?.data as ApiMovement);
  },

  getSupplierOptions: async (): Promise<StockMovementSupplierOption[]> => {
    const response = await client.get("/suppliers", {
      params: { page: 1, recordPerPage: 100 },
    });
    return asArray<ApiSupplier>(response.data?.data).map((supplier) => ({
      _id: supplier._id,
      name: supplier.supplierName ?? supplier.name ?? supplier._id,
    }));
  },

  getLocationOptions: async (): Promise<StockMovementLocationOption[]> => {
    const [warehousesResponse, branchesResponse] = await Promise.all([
      client.get("/warehouses", { params: { page: 1, recordPerPage: 100 } }),
      client.get("/branches", { params: { page: 1, recordPerPage: 100 } }),
    ]);

    const warehouses = asArray<ApiLocation>(warehousesResponse.data?.data).map(
      (warehouse) => ({
        _id: warehouse._id,
        name: warehouse.name ?? warehouse._id,
        type: "warehouse" as const,
      }),
    );
    const branches = asArray<ApiLocation>(branchesResponse.data?.data).map(
      (branch) => ({
        _id: branch._id,
        name: branch.name ?? branch._id,
        type: "branch" as const,
      }),
    );

    return [...warehouses, ...branches];
  },

  getProductItemOptions: async (): Promise<StockMovementProductItemOption[]> => {
    const response = await client.get("/products", {
      params: { page: 1, recordPerPage: 100 },
    });
    return asArray<ApiProduct>(response.data?.data).flatMap((product) =>
      asArray<ApiProductItem>(product.items ?? product.productItems).map((item) => ({
        _id: item._id,
        name: item.productName ?? item.name ?? product.name ?? item._id,
        sku: item.sku ?? "",
      })),
    );
  },
};
