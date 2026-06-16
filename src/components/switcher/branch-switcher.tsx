import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BranchFormDialog, type BranchFormValues } from "./branch-form-dialog";
import {
  WarehouseFormDialog,
  type WarehouseFormValues,
} from "./warehouse-form-dialog";
import { toast } from "sonner";

type BranchSwitcherProps = {
  branches: {
    name: string;
    logo: React.ElementType;
    address: string;
  }[];
  warehouses: {
    name: string;
    logo: React.ElementType;
    address: string;
  }[];
};

export function BranchSwitcher({ branches, warehouses }: BranchSwitcherProps) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(branches[0]);
  const [activeWarehouse, setActiveWarehouse] = React.useState(warehouses[0]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] =
    React.useState(false);

  const handleCreateBranch = (values: BranchFormValues) => {
    console.log("Dữ liệu chi nhánh mới:", values);
    toast.success(`Đã tạo chi nhánh "${values.name}" thành công!`);
    setIsDialogOpen(false);
  };

  const handleCreateWarehouse = (values: WarehouseFormValues) => {
    console.log("Dữ liệu kho hàng mới:", values);
    toast.success(`Đã tạo kho hàng "${values.name}" thành công!`);
    setIsWarehouseDialogOpen(false);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <activeTeam.logo className="size-4" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam.name}
                  </span>
                  <span className="truncate text-xs">{activeTeam.address}</span>
                </div>
                <ChevronsUpDown className="ms-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Chi nhánh
              </DropdownMenuLabel>
              {branches.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <team.logo className="size-4 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="gap-2 p-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setIsDialogOpen(true);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Thêm chi nhánh
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Kho hàng
              </DropdownMenuLabel>
              {warehouses.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <team.logo className="size-4 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="gap-2 p-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setIsWarehouseDialogOpen(true);
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Thêm kho hàng
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <BranchFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateBranch}
      />

      <WarehouseFormDialog
        open={isWarehouseDialogOpen}
        onOpenChange={setIsWarehouseDialogOpen}
        onSubmit={handleCreateWarehouse}
      />
    </>
  );
}
