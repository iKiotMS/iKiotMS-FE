"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { paySheetApi } from "@/lib/api/paysheet";
import { getPaySheetApiErrorMessage } from "@/lib/api/paysheet-mapper";
import type { PaySheet, PaySheetPayload } from "@/types/paysheet";

type PayrollDialogType = "add" | "edit";

export type PaySheetListQuery = {
  page: number;
  recordPerPage: number;
  name: string;
};

type PayrollContextType = {
  paySheets: PaySheet[];
  isInitialLoading: boolean;
  isFetching: boolean;
  total: number;
  totalPages: number;
  listQuery: PaySheetListQuery;
  nameInput: string;
  setNameInput: (value: string) => void;
  setListQuery: React.Dispatch<React.SetStateAction<PaySheetListQuery>>;
  open: PayrollDialogType | null;
  setOpen: (value: PayrollDialogType | null) => void;
  currentRow: PaySheet | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<PaySheet | null>>;
  fetchPaySheets: () => Promise<void>;
  handleAdd: (payload: PaySheetPayload) => Promise<void>;
  handleEdit: (id: string, payload: PaySheetPayload) => Promise<void>;
  updatePage: (page: number) => void;
  updatePageSize: (recordPerPage: number) => void;
};

const PayrollContext = React.createContext<PayrollContextType | null>(null);

const DEFAULT_LIST_QUERY: PaySheetListQuery = {
  page: 1,
  recordPerPage: 10,
  name: "",
};

export function PayrollProvider({ children }: { children: React.ReactNode }) {
  const [paySheets, setPaySheets] = useState<PaySheet[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [listQuery, setListQuery] = useState<PaySheetListQuery>(DEFAULT_LIST_QUERY);
  const [nameInput, setNameInput] = useState("");
  const [open, setOpen] = useState<PayrollDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<PaySheet | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setListQuery((prev) => {
        if (prev.name === nameInput) return prev;
        return { ...prev, name: nameInput, page: 1 };
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [nameInput]);

  const fetchPaySheets = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await paySheetApi.getList({
        page: listQuery.page,
        recordPerPage: listQuery.recordPerPage,
        name: listQuery.name || undefined,
      });
      setPaySheets(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getPaySheetApiErrorMessage(error));
    } finally {
      setIsInitialLoading(false);
      setIsFetching(false);
    }
  }, [listQuery]);

  useEffect(() => {
    fetchPaySheets();
  }, [fetchPaySheets]);

  function updatePage(page: number) {
    setListQuery((prev) => ({ ...prev, page }));
  }

  function updatePageSize(recordPerPage: number) {
    setListQuery((prev) => ({ ...prev, recordPerPage, page: 1 }));
  }

  async function handleAdd(payload: PaySheetPayload) {
    try {
      await paySheetApi.create(payload);
      toast.success("Đã tạo mẫu bảng lương");
      setOpen(null);
      await fetchPaySheets();
    } catch (error) {
      toast.error(getPaySheetApiErrorMessage(error));
      throw error;
    }
  }

  async function handleEdit(id: string, payload: PaySheetPayload) {
    try {
      await paySheetApi.update(id, payload);
      toast.success("Đã cập nhật mẫu bảng lương");
      setOpen(null);
      setCurrentRow(null);
      await fetchPaySheets();
    } catch (error) {
      toast.error(getPaySheetApiErrorMessage(error));
      throw error;
    }
  }

  return (
    <PayrollContext.Provider
      value={{
        paySheets,
        isInitialLoading,
        isFetching,
        total,
        totalPages,
        listQuery,
        nameInput,
        setNameInput,
        setListQuery,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        fetchPaySheets,
        handleAdd,
        handleEdit,
        updatePage,
        updatePageSize,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayroll() {
  const ctx = React.useContext(PayrollContext);
  if (!ctx) throw new Error("usePayroll must be used within <PayrollProvider>");
  return ctx;
}
