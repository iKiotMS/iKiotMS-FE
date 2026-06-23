"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  shiftTemplateApi,
  workingScheduleApi,
} from "@/lib/api/schedule";
import { mapShiftTemplatesToOptions } from "@/lib/api/schedule-mapper";
import { staffApi } from "@/lib/api/staff";
import {
  getApiErrorMessage,
  getStaffRoleLabel,
} from "@/lib/api/staff-mapper";
import type {
  CreateWorkingSchedulePayload,
  ScheduleListQuery,
  ScheduleStatus,
  ShiftTemplate,
  ShiftTemplateOption,
  UpdateShiftTemplatePayload,
  UpdateWorkingSchedulePayload,
  WorkingSchedule,
} from "@/types/working-schedule";

type ScheduleDialogType = "add" | "edit" | "delete" | "shiftTemplate";

const DEFAULT_LIST_QUERY: ScheduleListQuery = {
  page: 1,
  recordPerPage: 10,
  userId: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

type ScheduleContextType = {
  schedules: WorkingSchedule[];
  isInitialLoading: boolean;
  isFetching: boolean;
  total: number;
  totalPages: number;
  listQuery: ScheduleListQuery;
  open: ScheduleDialogType | null;
  setOpen: (value: ScheduleDialogType | null) => void;
  currentRow: WorkingSchedule | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<WorkingSchedule | null>>;
  fetchScheduleById: (id: string) => Promise<WorkingSchedule | null>;
  handleAdd: (payload: CreateWorkingSchedulePayload) => Promise<void>;
  handleEdit: (
    id: string,
    payload: UpdateWorkingSchedulePayload,
  ) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleCreateShiftTemplate: (
    payload: UpdateShiftTemplatePayload,
  ) => Promise<void>;
  handleUpdateShiftTemplate: (
    id: string,
    payload: UpdateShiftTemplatePayload,
  ) => Promise<void>;
  handleDeleteShiftTemplate: (id: string) => Promise<void>;
  shiftTemplates: ShiftTemplate[];
  shiftTemplateOptions: ShiftTemplateOption[];
  staffOptions: { value: string; label: string }[];
  updateStatusFilter: (status: ScheduleStatus | "all") => void;
  updateUserFilter: (userId: string) => void;
  updateStartDateFilter: (startDate: string) => void;
  updateEndDateFilter: (endDate: string) => void;
  updatePage: (page: number) => void;
  updatePageSize: (recordPerPage: number) => void;
};

const ScheduleContext = React.createContext<ScheduleContextType | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [listQuery, setListQuery] = useState<ScheduleListQuery>(
    DEFAULT_LIST_QUERY,
  );
  const [open, setOpen] = useState<ScheduleDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<WorkingSchedule | null>(null);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [shiftTemplateOptions, setShiftTemplateOptions] = useState<
    ShiftTemplateOption[]
  >([]);
  const [staffOptions, setStaffOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const refreshShiftTemplates = useCallback(async () => {
    try {
      const res = await shiftTemplateApi.getList({ recordPerPage: 100 });
      const templates = res.data ?? [];
      setShiftTemplates(templates);
      setShiftTemplateOptions(mapShiftTemplatesToOptions(templates));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setShiftTemplates([]);
      setShiftTemplateOptions([]);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await workingScheduleApi.getList({
        page: listQuery.page,
        recordPerPage: listQuery.recordPerPage,
        userId: listQuery.userId === "all" ? undefined : listQuery.userId,
        status: listQuery.status === "all" ? undefined : listQuery.status,
        startDate: listQuery.startDate || undefined,
        endDate: listQuery.endDate || undefined,
      });
      setSchedules(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setSchedules([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
    }
  }, [listQuery]);

  const fetchScheduleById = useCallback(async (id: string) => {
    try {
      return await workingScheduleApi.getById(id);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    void refreshShiftTemplates();
  }, [refreshShiftTemplates]);

  useEffect(() => {
    void staffApi
      .getActiveForScheduleOptions()
      .then((activeStaff) => {
        setStaffOptions(
          activeStaff.map((s) => ({
            value: s._id,
            label: `${s.fullName} (${getStaffRoleLabel(s.role)})`,
          })),
        );
      })
      .catch(() => {
        setStaffOptions([]);
      });
  }, []);

  async function handleAdd(payload: CreateWorkingSchedulePayload) {
    try {
      await workingScheduleApi.create(payload);
      toast.success("Đã thêm lịch làm việc");
      await fetchSchedules();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleEdit(
    id: string,
    payload: UpdateWorkingSchedulePayload,
  ) {
    try {
      await workingScheduleApi.update(id, payload);
      toast.success("Đã cập nhật lịch làm việc");
      await fetchSchedules();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleDelete(id: string) {
    try {
      await workingScheduleApi.remove(id);
      toast.success("Đã xóa lịch làm việc");
      await fetchSchedules();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleCreateShiftTemplate(
    payload: UpdateShiftTemplatePayload,
  ) {
    try {
      await shiftTemplateApi.create(payload);
      toast.success("Đã tạo ca mẫu");
      await refreshShiftTemplates();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleUpdateShiftTemplate(
    id: string,
    payload: UpdateShiftTemplatePayload,
  ) {
    try {
      await shiftTemplateApi.update(id, payload);
      toast.success("Đã cập nhật ca mẫu");
      await refreshShiftTemplates();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleDeleteShiftTemplate(id: string) {
    try {
      await shiftTemplateApi.remove(id);
      toast.success("Đã xóa ca mẫu");
      await refreshShiftTemplates();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  const updateStatusFilter = useCallback((status: ScheduleStatus | "all") => {
    setListQuery((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const updateUserFilter = useCallback((userId: string) => {
    setListQuery((prev) => ({ ...prev, userId, page: 1 }));
  }, []);

  const updateStartDateFilter = useCallback((startDate: string) => {
    setListQuery((prev) => ({ ...prev, startDate, page: 1 }));
  }, []);

  const updateEndDateFilter = useCallback((endDate: string) => {
    setListQuery((prev) => ({ ...prev, endDate, page: 1 }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setListQuery((prev) => ({ ...prev, page }));
  }, []);

  const updatePageSize = useCallback((recordPerPage: number) => {
    setListQuery((prev) => ({ ...prev, recordPerPage, page: 1 }));
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        isInitialLoading,
        isFetching,
        total,
        totalPages,
        listQuery,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        fetchScheduleById,
        handleAdd,
        handleEdit,
        handleDelete,
        handleCreateShiftTemplate,
        handleUpdateShiftTemplate,
        handleDeleteShiftTemplate,
        shiftTemplates,
        shiftTemplateOptions,
        staffOptions,
        updateStatusFilter,
        updateUserFilter,
        updateStartDateFilter,
        updateEndDateFilter,
        updatePage,
        updatePageSize,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = React.useContext(ScheduleContext);
  if (!ctx)
    throw new Error("useSchedule must be used within <ScheduleProvider>");
  return ctx;
}
