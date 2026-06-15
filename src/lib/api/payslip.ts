import client from "./client";
import type {
  CreatePayslipPayload,
  GeneratePayrollPayload,
  Payslip,
  PayslipListResponse,
  PayslipQueryParams,
  UpdatePayslipPayload,
} from "@/types/payslip";

export const payslipApi = {
  getList: async (params?: PayslipQueryParams): Promise<PayslipListResponse> => {
    const response = await client.get("/payslips", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Payslip> => {
    const response = await client.get(`/payslips/${id}`);
    return response.data;
  },

  create: async (payload: CreatePayslipPayload): Promise<Payslip> => {
    const response = await client.post("/payslips", payload);
    return response.data;
  },

  generate: async (payload: GeneratePayrollPayload): Promise<Payslip[]> => {
    const response = await client.post("/payslips/generate", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdatePayslipPayload): Promise<Payslip> => {
    const response = await client.patch(`/payslips/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/payslips/${id}`);
  },
};
