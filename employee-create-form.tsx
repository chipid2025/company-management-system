import { InsertEmployee, Department, insertEmployeeSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { EmployeeFileUpload } from "./employee-file-upload";

interface EmployeeCreateFormProps {
  departments?: Department[];
  onSuccess?: () => void;
}

export function EmployeeCreateForm({ departments, onSuccess }: EmployeeCreateFormProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<{
    portraitPhoto: File | null;
    identityCardFront: File | null;
    identityCardBack: File | null;
    contractFile: File | null;
  }>({
    portraitPhoto: null,
    identityCardFront: null,
    identityCardBack: null,
    contractFile: null
  });

  // Query để lấy mã nhân viên mới
  const nextCodeQuery = useQuery({
    queryKey: ['/api/employees/next-code'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/employees/next-code');
      if (!response.ok) {
        throw new Error('Không thể lấy mã nhân viên mới');
      }
      const data = await response.json();
      return data.code;
    }
  });

  const form = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: '',
      identityCard: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      gender: undefined,
      position: undefined,
      dateOfBirth: undefined,
      departmentId: undefined,
      contractStartDate: undefined,
      contractEndDate: undefined,
      basicSalary: undefined,
      performanceSalary: undefined,
      productSalary: undefined,
      bankAccount: '',
      bankName: '',
      taxCode: '',
      insuranceNumber: '',
      notes: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      try {
        console.log('Form data:', data);

        const formData = new FormData();

        // Process all form fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        // Handle file uploads
        if (files.portraitPhoto) {
          formData.append('profileImage', files.portraitPhoto);
        }
        if (files.identityCardFront) {
          formData.append('identityCardFront', files.identityCardFront);
        }
        if (files.identityCardBack) {
          formData.append('identityCardBack', files.identityCardBack);
        }
        if (files.contractFile) {
          formData.append('contractFile', files.contractFile);
        }

        const response = await apiRequest("POST", '/api/employees', formData);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Không thể tạo nhân viên mới');
        }

        return await response.json();
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees/next-code'] });
      onSuccess?.();
      form.reset();
      setFiles({
        portraitPhoto: null,
        identityCardFront: null,
        identityCardBack: null,
        contractFile: null
      });
      toast({
        title: "Thành công",
        description: "Đã thêm nhân viên mới"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} 
        className="space-y-6"
      >
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>

          {/* Hiển thị mã nhân viên mới */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">Mã nhân viên mới sẽ được tạo:</p>
            <p className="text-2xl font-bold mt-2">
              {nextCodeQuery.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : nextCodeQuery.isError ? (
                <span className="text-destructive">Lỗi: Không thể lấy mã nhân viên</span>
              ) : (
                nextCodeQuery.data
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Họ tên <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identityCard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số CMND/CCCD <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Giới tính <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thông tin công việc</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value, 10))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chức vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Nhân viên</SelectItem>
                      <SelectItem value="manager">Quản lý</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày bắt đầu hợp đồng</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày kết thúc hợp đồng</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Giấy tờ cá nhân */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Giấy tờ cá nhân</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <EmployeeFileUpload
                label="Ảnh đại diện"
                accept=".jpg,.jpeg"
                file={files.portraitPhoto}
                onChange={(file) => setFiles(prev => ({ ...prev, portraitPhoto: file }))}
              />

              <EmployeeFileUpload
                label="CMND/CCCD mặt trước"
                accept=".jpg,.jpeg"
                file={files.identityCardFront}
                onChange={(file) => setFiles(prev => ({ ...prev, identityCardFront: file }))}
              />

              <EmployeeFileUpload
                label="CMND/CCCD mặt sau"
                accept=".jpg,.jpeg"
                file={files.identityCardBack}
                onChange={(file) => setFiles(prev => ({ ...prev, identityCardBack: file }))}
              />

              <EmployeeFileUpload
                label="File hợp đồng"
                accept="application/pdf"
                file={files.contractFile}
                onChange={(file) => setFiles(prev => ({ ...prev, contractFile: file }))}
              />
            </div>
          </div>
        </div>

        {/* Thông tin tài chính */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Thông tin tài chính</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tài khoản</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên ngân hàng</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã số thuế</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insuranceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số bảo hiểm xã hội</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang thêm...
              </>
            ) : "Thêm nhân viên"}
          </Button>
        </div>
      </form>
    </Form>
  );
}