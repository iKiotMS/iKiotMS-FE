import client from "./client";
import {
  mapPaySheetFromApi,
  type ApiPaySheet,
} from "./paysheet-mapper";
import type {
  PaySheet,
  PaySheetListResponse,
  PaySheetPayload,
  PaySheetQueryParams,
} from "@/types/paysheet";

interface PaySheetListApiResponse {
  data: ApiPaySheet[];
  pagination?: {
    total: number;
    page: number;
    recordPerPage: number;
    totalPages: number;
  };
}

interface PaySheetMutationResponse {
  message?: string;
  data: ApiPaySheet;
}

export const paySheetApi = {
  getList: async (
    params?: PaySheetQueryParams,
  ): Promise<PaySheetListResponse> => {
    const response = await client.get<PaySheetListApiResponse>(
      "/payroll/paysheets",
      {
        params: {
          page: params?.page ?? 1,
          recordPerPage: params?.recordPerPage ?? 10,
          name: params?.name,
        },
      },
    );

    const pagination = response.data?.pagination;
    const items = response.data?.data ?? [];
    const recordPerPage = pagination?.recordPerPage ?? items.length;
    const total = pagination?.total ?? items.length;
    const totalPages =
      pagination?.totalPages ??
      Math.max(1, Math.ceil(total / (recordPerPage || 1)));

    return {
      data: items.map(mapPaySheetFromApi),
      total,
      page: pagination?.page ?? 1,
      limit: recordPerPage,
      totalPages,
    };
  },

  getById: async (id: string): Promise<PaySheet> => {
    const response = await client.get<ApiPaySheet>(
      `/payroll/paysheets/${id}`,
    );
    return mapPaySheetFromApi(response.data);
  },

  create: async (payload: PaySheetPayload): Promise<PaySheet> => {
    const response = await client.post<PaySheetMutationResponse>(
      "/payroll/paysheets",
      payload,
    );
    return mapPaySheetFromApi(response.data.data);
  },

  update: async (id: string, payload: PaySheetPayload): Promise<PaySheet> => {
    const response = await client.put<PaySheetMutationResponse>(
      `/payroll/paysheets/${id}`,
      payload,
    );
    return mapPaySheetFromApi(response.data.data);
  },
};
