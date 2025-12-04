import { useNavigate } from "react-router-dom"
import { z } from "zod"
import { schema } from "@/components/data-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Personal = z.infer<typeof schema>

interface DetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Personal
}

export default function DetailModal({ open, onOpenChange, data }: DetailModalProps) {
  const navigate = useNavigate()

  if (!data) return null

  const handleEdit = () => {
    navigate(`/admin/personal/edit/${data._id}`)
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa cá nhân này không?")) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/personals/${data._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      alert("Xóa thành công")
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      alert("Xóa thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
            <DialogTitle>Thông tin chi tiết</DialogTitle>
            <DialogDescription>Xem và chỉnh sửa thông tin tín đồ</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            {/* Avatar + tên + chức vụ */}
            <div className="flex items-center gap-4">
                <img
                    src={data.avatarUrl || "/avtdefault.png"}
                    className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                <p className="font-bold text-lg">{data.fullname}</p>
                <p className="text-muted-foreground">{data.position || "Chưa có"}</p>
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div><b>Giới tính:</b> {data.gender || "Chưa có"}</div>
            <div><b>Ngày sinh:</b> {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "Chưa có"}</div>
            <div><b>Trạng thái:</b>  {data.status || "Chưa có"}</div>
            <div><b>Địa chỉ:</b> {data.address || "Chưa có"}</div>
            <div><b>Ngày tham gia:</b> {data.joinDate ? new Date(data.joinDate).toLocaleDateString() : "Chưa có"}</div>
            <div><b>Department:</b> {data.departmentId || "Chưa có"}</div>
            <div><b>Chùa hiện tại:</b> {data.currentTempleId || "Chưa có"}</div>
            <div className="col-span-2"><b>Ghi chú:</b> {data.note || "Chưa có"}</div>
          </div>

          {/* Lịch sử chùa */}
          <div>
            <b>Lịch sử chùa:</b>
            <ul className="list-disc pl-6">
              {data.templeHistory.length > 0 ? (
                data.templeHistory.map((t, idx) => (
                  <li key={idx}>
                    Chùa: {t.templeId}, Tham gia: {t.joinedAt ? new Date(t.joinedAt).toLocaleDateString() : "?"}, Rời: {t.leftAt ? new Date(t.leftAt).toLocaleDateString() : "-"}
                  </li>
                ))
              ) : (
                <li>Chưa có lịch sử chùa</li>
              )}
            </ul>
          </div>

          {/* Thời gian tạo/cập nhật */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div><b>Ngày tạo:</b> {new Date(data.createdAt).toLocaleString()}</div>
            <div><b>Ngày cập nhật:</b> {new Date(data.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Nút thao tác */}
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleEdit}>Sửa</Button>
          <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
