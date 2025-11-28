import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="
      grid gap-4 px-4 lg:px-6
      grid-cols-1       /* mobile: 1 card mỗi hàng */
      sm:grid-cols-2    /* tablet: 2 card mỗi hàng */
      lg:grid-cols-4    /* desktop: 4 card mỗi hàng */">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-2xl mb-2">Tổng số Tín đồ</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,250
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-m">
          <div className="text-muted-foreground">
            Tổng số tín đồ hiện tại
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-2xl mb-2">Sự kiện sắp tới</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-m">
          <div className="text-muted-foreground">
            Số sự kiện đã lên kế hoạch
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-2xl mb-2">Thư viện</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            100
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-m">
          <div className="text-muted-foreground">
            Tổng số tài liệu trong thư viện
            </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-2xl mb-2">Hỗ trợ</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            10
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-m">
          <div className="text-muted-foreground">
            Số tin nhắn hỗ trợ chưa xử lý
            </div>
        </CardFooter>
      </Card>
    </div>
  )
}
